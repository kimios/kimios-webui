import {Injectable} from '@angular/core';
import {
    Criteria,
    DMEntity,
    DocumentService,
    DocumentType as KimiosDocumentType,
    Folder,
    FolderService,
    SearchResponse,
    SearchService,
    Workspace,
    WorkspaceService
} from 'app/kimios-client-api';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {SessionService} from './session.service';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {TAG_META_DATA_PREFIX, TagService} from './tag.service';
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators';
import {Tag} from 'app/main/model/tag';
import {SearchEntityQuery} from 'app/main/model/search-entity-query';
import {DatePipe} from '@angular/common';
import {MetaWithValue} from 'app/main/model/meta-with-value';
import {MetaValueRange, MetaValueRangeDate, MetaValueRangeNumber} from 'app/main/model/meta-value-range';

export const PAGE_SIZE_DEFAULT = 20;
const DEFAULT_SORT_FIELD = 'versionUpdateDate';
const DEFAULT_SORT_DIRECTION = 'desc';
const DEFAULT_PAGE = 0;
export const DATE_FORMAT = 'yyyy-MM-dd';

export const metaTypeToCriteriaFieldNameMapping = {
    1: 'MetaDataString',
    2: 'MetaDataNumber',
    3: 'MetaDataDate',
    4: 'MetaDataBoolean',
    5: 'MetaDataList'
};
export const metaValueFromToSeparator = '#|#';

@Injectable({
    providedIn: 'root'
})
export class SearchEntityService implements Resolve<any> {

    get criterias(): Criteria[] {
        return this._criterias;
    }

    onFilesChanged: BehaviorSubject<Array<DMEntity>>;
    onFileSelected: BehaviorSubject<any>;
    onTagsDataChanged: BehaviorSubject<Array<Tag>>;
    onTotalFilesChanged: BehaviorSubject<number>;
    onSortChanged: BehaviorSubject<any>;

    // keep last query parameters to be able to reload
    private sortField: string;
    private sortDirection: string;
//    private page: number;
    private _pageSize: number;
    private page: number;
    private query: string;
    private _criterias: Criteria[];
    public currentSearchEntityQuery: SearchEntityQuery;
    public documentListForAutoComplete$: BehaviorSubject<Array<KimiosDocumentType>>;

    static compare(a: number | string, b: number | string, isAsc: boolean): number {

        if (typeof a === 'string' && typeof b === 'string') {
            return (a.toLowerCase() < b.toLowerCase() ? -1 : 1) * (isAsc ? 1 : -1);
        } else {
            return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
        }
    }

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        // Set the defaults

        private sessionService: SessionService,
        private documentService: DocumentService,
        private workspaceService: WorkspaceService,
        private folderService: FolderService,
        private searchService: SearchService,
        private tagService: TagService,
        private datePipe: DatePipe
    ) {
        this.onFilesChanged = new BehaviorSubject<Array<DMEntity>>([]);
        this.onFileSelected = new BehaviorSubject({});
        this.onTagsDataChanged = new BehaviorSubject([]);
        this.onTotalFilesChanged = new BehaviorSubject(undefined);
        this.onSortChanged = new BehaviorSubject({});
        this._pageSize = PAGE_SIZE_DEFAULT;
        this._criterias = new Array<Criteria>();
        this.documentListForAutoComplete$ = new BehaviorSubject<Array<DocumentType>>(new Array<DocumentType>());
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DMEntity[]> {
        return this.getFiles(
                    this.sortField ? this.sortField : DEFAULT_SORT_FIELD,
                    this.sortDirection ? this.sortDirection : DEFAULT_SORT_DIRECTION,
                    this.page ? this.page : DEFAULT_PAGE,
                    this._pageSize ? this._pageSize : PAGE_SIZE_DEFAULT,
                    this.query,
                    this._criterias
                );
    }

    /**
     * Get files
     *
     * @returns {Promise<any>}
     */
    getFiles(
        sortField = DEFAULT_SORT_FIELD,
        sortDirection = DEFAULT_SORT_DIRECTION,
        page = DEFAULT_PAGE,
        pageSize = PAGE_SIZE_DEFAULT,
        query: string,
        criterias = [],
        onlyTags = false
    ): Observable<DMEntity[]> {

        // TODO: enhance search requests history
        this.sortField = sortField;
        this.sortDirection = sortDirection;
        this._pageSize = pageSize ? pageSize : this._pageSize;
        this.page = page;
        this.query = query;
        this._criterias = criterias;

        // TODO: enhance sorfielf mapping:

        const searchFieldMapping = {
            versionUpdateDate: 'DocumentVersionUpdateDate',
            lastUpdateAuthor: 'DocumentVersionLastUpdateAuthor',
            documentTypeName: 'DocumentTypeName',
            name: 'DocumentName',
            length: 'DocumentVersionLength'
        };

        return this.getSearchResponse(
            searchFieldMapping[sortField],
            sortDirection,
            page,
            pageSize,
            query,
            criterias
        ).pipe(
            switchMap(
                res => of(res).catch(error => of(error))
            ),
            catchError(error => {
                // console.log('we catched the error !');
                console.log('getFiles( '
                    + sortField
                    + ' : string, '
                    + sortDirection
                    + ' : string, '
                    + page
                    + ' : number, '
                    + pageSize
                    + ' : number, '
                    + query
                    + ' : string, '
                    + criterias
                    + ' = [], '
                    + onlyTags
                    + ' = false)'
                );
                console.log(error);
                return of([]);
            }),
            map(
                response => {
                    console.log('loaded results', response);
                    this.handleFilesLoad(response, onlyTags);
                    return (response.rows == null || response.rows === undefined ) ?
                        [] :
                        response.rows;
                }
            )
        );
    }

    getSearchResponse(
        sortField = DEFAULT_SORT_FIELD,
        sortDirection = DEFAULT_SORT_DIRECTION,
        page = DEFAULT_PAGE,
        pageSize = PAGE_SIZE_DEFAULT,
        query: string, criterias = []
    ): Observable<SearchResponse> {
        return this.tagService.loadTagsRaw()
            .pipe(
                map(
                    (tagList) => tagList.map((field) => ({
                        fieldName: TAG_META_DATA_PREFIX + field.uid,
                        faceted: true
                    }))
                ),
                concatMap(
                    (res) =>
                        this.searchService.advancedSearchDocuments(this.sessionService.sessionToken,
                            page * pageSize, pageSize, sortField, sortDirection, null, -1, false, criterias.concat(res), null, false)
                )
            );
    }

    handleFilesLoad(response: any, onlyTags: boolean): void {
        if (! onlyTags) {
            this.onFilesChanged.next((response.rows == null || response.rows === undefined ) ? [] : response.rows);
            if (response.rows != null
                && response.rows !== undefined
                && response.rows.length !== 0 ) {
                this.onFileSelected.next(response.rows[0]);
            }
            this.onTotalFilesChanged.next((response.results == null || response.results === undefined ) ? [] : response.results);
        }
        this.onTagsDataChanged.next((response.allfacetsData == null || response.allfacetsData === undefined ) ? [] : this.extractTags(response.allfacetsData));
    }

    reloadFiles(): Observable<DMEntity[]> {
        return this.getFiles(this.sortField, this.sortDirection, 0, this._pageSize, this.query);
    }

    reloadTags(): Observable<DMEntity[]> {
        return this.getFiles(this.sortField, this.sortDirection, this.page, this._pageSize, this.query, this._criterias, true);
    }

    searchInContent(content: string, criterias = []): Observable<DMEntity[]> {
        criterias.push({
            fieldName: 'DocumentBody',
            query: content,
//            filterQuery: true
        });
        return this.getFiles(this.sortField, this.sortDirection, 0, this._pageSize, this.query, criterias);
    }

    searchWithFiltersOld(content: string, filename: string, tagList: Tag[], documentParent = '', onlyTags = false): Observable<DMEntity[]> {
        let criterias = new Array<Criteria>();
        if (documentParent !== '') {
            criterias.push({
                fieldName: 'DocumentParent',
                query: documentParent,
                // filterQuery: true
            });
        }
        if (content) {
            criterias.push({
                fieldName: 'DocumentBody',
                query: content,
//            filterQuery: true
            });
        }
        if (filename) {
            criterias = criterias.concat(this.filenameTermsToCriterias(filename));
        }
        if (tagList.length > 0) {
            tagList.forEach(tag => criterias.push({
                fieldName: TagService.TAG_META_DATA_NAME_PREFIX + tag['_uid'].toString(),
                query: tag['_uid'].toString(),
                metaId: tag['_uid'],
                // filterQuery: true
            }));
        }
        return this.getFiles(this.sortField, this.sortDirection, 0, this._pageSize, this.query, criterias, onlyTags);
    }

    searchWithFiltersAndSetCurrentQuery(
        content: string,
        filename: string,
        tagList: Array<string>,
        uid: number,
        documentParent: Folder | Workspace,
        owner: string,
        dateMin: Date,
        dateMax: Date,
        documentType: KimiosDocumentType,
        metas: Array<MetaWithValue>,
        onlyTags = false,
        pushToAutoComplete = false
    ): Observable<DMEntity[]> {
        this.currentSearchEntityQuery = <SearchEntityQuery> {
            name: filename,
            content: content,
            tags: tagList,
            folder: documentParent,
            dateMin: dateMin,
            dateMax: dateMax,
            owner: owner,
            id: uid,
            documentType: documentType,
            metas: metas
        };

        return this.searchWithFilters(
            content,
            filename,
            tagList,
            uid,
            documentParent != null ? documentParent.path : null,
            owner,
            this.datePipe.transform(dateMin, DATE_FORMAT),
            this.datePipe.transform(dateMax, DATE_FORMAT),
            documentType != null ? documentType.uid : null,
            metas,
            onlyTags
        ).pipe(
          tap(documentList => {
              if (pushToAutoComplete === true) {
                  this.documentListForAutoComplete$.next(documentList);
              }
          })
        );
    }

    searchWithFilters(
        content: string,
        filename: string,
        tagList: Array<string>,
        uid: number,
        documentParent: string,
        owner: string,
        dateMin: string,
        dateMax: string,
        documentTypeUid: number,
        metas: Array<MetaWithValue>,
        onlyTags = false
    ): Observable<DMEntity[]> {

        let criterias = new Array<Criteria>();
        if (documentParent != null && documentParent !== undefined) {
            criterias.push({
                fieldName: 'DocumentParent',
                query: documentParent.toString(),
                // filterQuery: true
            });
        }
        if (content) {
            criterias.push({
                fieldName: 'DocumentBody',
                query: content,
//            filterQuery: true
            });
        }
        if (filename) {
            criterias = criterias.concat(this.filenameTermsToCriterias(filename));
        }
        if (tagList != null
            && tagList.length > 0) {
            criterias.push({
                fieldName: 'DocumentTags',
                query: tagList.join('||')
            });
        }
        criterias.push({
            fieldName: 'DocumentTags',
            faceted: true
        });
        if (uid != null && uid !== undefined && uid > 0) {
            criterias.push({
                fieldName: 'DocumentUid',
                query: uid.toString()
            });
        }
        if (owner != null && owner !== undefined) {
            criterias.push({
                fieldName: 'DocumentOwner',
                query: owner
            });
        }
        if (documentTypeUid != null) {
            criterias.push({
                fieldName: 'DocumentTypeUid',
                query: documentTypeUid.toString()
            });
        }
        if (metas != null && metas.length > 0) {
            criterias = criterias.concat(this.makeCriteriasFromMetas(metas));
        }

        const regexDateFormat = new RegExp('^\\\d\\\d\\\d\\\d-\\\d\\\d-\\\d\\\d$');
        const hasDateMin = dateMin != null && dateMin !== undefined && regexDateFormat.test(dateMin);
        const hasDateMax = dateMax != null && dateMax !== undefined && regexDateFormat.test(dateMax);
        if (hasDateMin || hasDateMax) {
            criterias.push({
                fieldName: 'DocumentVersionUpdateDate',
                rangeMin: hasDateMin ? dateMin : null,
                rangeMax: hasDateMax ? dateMax : null
            });
        }

        return this.getFiles(this.sortField, this.sortDirection, 0, this._pageSize, this.query, criterias, onlyTags);
    }

    searchInContentWithFacets(content: string, facetFields: string[]): Observable<DMEntity[]> {
        const criterias = facetFields.map(
            (field) => ({
                facetField: field
            })
        );
        return this.searchInContent(content, criterias);
    }

    // extractFacets()

    searchDocumentsByName(searchTerm: string, documentParent = ''): Observable<SearchResponse> {
        const criterias = this.filenameTermsToCriterias(searchTerm);
        if (documentParent !== '') {
            criterias.push({
                fieldName: 'DocumentParent',
                query: documentParent
            });
        }

        return this.searchService.advancedSearchDocuments(
            this.sessionService.sessionToken,
            0,
            25,
            'DocumentName',
            'asc',
            null,
            -1,
            false,
            criterias,
            null,
            false
        );
    }

    private filenameTermsToCriterias(searchTerm: string): Criteria[] {
        return searchTerm.split(' ')
            .filter(w => w.length > 2)
            .map(w => ({
                fieldName: 'DocumentName',
                query: w,
//            filterQuery: true
            }));
    }

    searchDocumentsNames(searchTerm: string, documentParent = ''): Observable<Array<string>> {
        return this.searchDocumentsByName(searchTerm, documentParent).pipe(
            map(
                res => res.rows.map(dmEntity => dmEntity.name)
            )
        );
    }

    searchDocumentsByContent(searchTerm: string): Observable<SearchResponse> {
        const criterias = [{
            fieldName: 'DocumentBody',
            query: searchTerm,
//            filterQuery: true
        }];

        return this.searchService.advancedSearchDocuments(
            this.sessionService.sessionToken,
            0,
            25,
            'DocumentName',
            '',
            null,
            -1,
            false,
            criterias,
            null,
            false
        );
    }

    private extractTags(facetsData: Map<string, { [p: string]: any }>): Array<Tag> {
        const array = new Array<Tag>();
        const allTags = this.tagService.allTagsMap;
        for (const key of Object.keys(facetsData)) {
            const tagId = key.replace(new RegExp('^' + TagService.TAG_META_DATA_NAME_PREFIX), '');
            const facetValues = facetsData[key];
            for (const index of Object.keys(facetValues)) {
                const facetValue = facetValues[index];
                if (facetValue[0] !== ''
                    && facetValue[1] > 0
                    && allTags.has(+tagId)) {
                    const tag = new Tag(allTags.get(+tagId).name, +tagId);
                    tag.count = facetValue[1];
                    array.push(tag);
                }
            }
        }
        return array;
    }

    public changePage(page, pageSize): Observable<DMEntity[]> {
        return this.getFiles(this.sortField, this.sortDirection, page, pageSize, this.query, this._criterias);
    }

    public changeSort(sortField, sortDirection): Observable<DMEntity[]> {
        this.onSortChanged.next(sortField + ' ' + sortDirection);
        return this.getFiles(sortField, sortDirection, this.page, this._pageSize, this.query, this._criterias);
    }

    public getDocumentsInDir(sortField: string, sortDirection: string, page: number, parentDirUid: number): Observable<DMEntity[]> {
        const criterias = new Array<Criteria>();
        criterias.push({
            fieldName: 'DocumentParentId',
            query: parentDirUid.toString()
        });
        return this.getFiles(sortField, sortDirection, page, this._pageSize, this.query, criterias);
    }

    public retrieveAllTags(): Observable<Map<string, number>> {
        const criterias = new Array<Criteria>();
        criterias.push({
            fieldName: 'DocumentTags',
            faceted: true
        });
        return this.searchService.advancedSearchDocuments(
            this.sessionService.sessionToken,
            0,
            0,
            null,
            null,
            null,
            -1,
            false,
            criterias,
            null,
            false
        ).pipe(
            map(response => {
                const mapTags = new Map<string, number>();
                const facetValues = response.allfacetsData['DocumentTags'];
                if (facetValues != null
                    && facetValues !== undefined) {
                    for (const index of Object.keys(facetValues)) {
                        const facetValue = facetValues[index];
                        if (facetValue[0] !== ''
                            && facetValue[1] > 0) {
                            mapTags.set(facetValue[0], facetValue[1]);
                        }
                    }
                }
                return mapTags;
            })
        );
    }

    loadQuery(query: SearchEntityQuery): void {
        this.searchWithFilters(
            query.content,
            query.name,
            query.tags,
            query.id,
            query.folder != null ? query.folder.path : null,
            query.owner,
            this.datePipe.transform(query.dateMin, DATE_FORMAT),
            this.datePipe.transform(query.dateMax, DATE_FORMAT),
            query.documentType != null ? query.documentType.uid : null,
            query.metas
        );
    }

    private makeCriteriasFromMetas(metas: Array<MetaWithValue>): Array<Criteria> {
        return metas.map(meta => <Criteria> {
            fieldName: metaTypeToCriteriaFieldNameMapping[meta.metaType] + '_' + meta.uid,
            level: 0,
            position: 0,
            rangeMin: meta.value instanceof MetaValueRangeDate ?
                this.datePipe.transform(meta.value.min, DATE_FORMAT) :
                meta.value instanceof MetaValueRangeNumber ?
                    meta.value.min :
                    null,
            rangeMax: meta.value instanceof MetaValueRangeDate ?
                this.datePipe.transform(meta.value.max, DATE_FORMAT) :
                meta.value instanceof MetaValueRangeNumber ?
                    meta.value.max :
                    null,
            query: meta.value instanceof MetaValueRange ? null : meta.value,
            metaId: meta.uid,
            metaType: meta.metaType
        });
    }

    get pageSize(): number {
        return this._pageSize;
    }
}
