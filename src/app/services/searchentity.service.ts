import {Injectable} from '@angular/core';
import {Criteria, DMEntity, Document, DocumentService, Folder, FolderService, SearchResponse, SearchService, Workspace, WorkspaceService} from 'app/kimios-client-api';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {SessionService} from './session.service';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {TAG_META_DATA_PREFIX, TagService} from './tag.service';
import {concatMap, map} from 'rxjs/operators';
import {Tag} from '../main/model/tag';

export const PAGE_SIZE_DEFAULT = 20;

@Injectable({
    providedIn: 'root'
})
export class SearchEntityService implements Resolve<any> {


    onFilesChanged: BehaviorSubject<any>;
    onFileSelected: BehaviorSubject<any>;
    onTagsDataChanged: BehaviorSubject<Array<Tag>>;
    onTotalFilesChanged: BehaviorSubject<any>;
    onSortChanged: BehaviorSubject<any>;

    // keep last query parameters to be able to reload
    private sortField: string;
    private sortDirection: string;
//    private page: number;
    private pageSize: number;
    private query: string;
    private criterias: Criteria[];

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
        private tagService: TagService
    ) {
        this.onFilesChanged = new BehaviorSubject({});
        this.onFileSelected = new BehaviorSubject({});
        this.onTagsDataChanged = new BehaviorSubject([]);
        this.onTotalFilesChanged = new BehaviorSubject({});
        this.onSortChanged = new BehaviorSubject({});
        this.pageSize = PAGE_SIZE_DEFAULT;
    }

    retrieveEntitiesAtPath(path: string): Observable<DMEntity[]> {
        let array: Observable<DMEntity[]>;
        let pathArray = path.split('/');
        return array;
    }


    retrieveEntity(path: string): Observable<DMEntity> {
        let entity: Observable<DMEntity>;
        entity = this.searchService.getDMentityFromPath(this.sessionService.sessionToken, path);
        console.log('entity ', entity);
        return entity;


    }

    retrieveUserWorkspaces(): Observable<Workspace[]> {
        return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
    }

    retrieveFolders(parent: DMEntity): Observable<Folder[]> {
        return this.folderService.getFolders(this.sessionService.sessionToken, parent.uid);
    }

    retrieveFolderFiles(parent: DMEntity): Observable<Document[]> {
        return this.documentService.getDocuments(this.sessionService.sessionToken, parent.uid);

    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getFiles('DocumentName', 'asc', 0, 20, null)
            ]).then(
                ([files]) => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get files
     *
     * @returns {Promise<any>}
     */
    getFiles(sortField: string, sortDirection: string, page: number, pageSize: number, query: string, criterias = []): Promise<any> {
        this.sortField = sortField;
        this.sortDirection = sortDirection;
        this.pageSize = pageSize ? pageSize : this.pageSize;
        this.query = query;
        this.criterias = criterias;

        return new Promise((resolve, reject) => {
            console.log('inside Promise getFiles entity Service...');
            if (!this.sessionService.sessionAlive) {
                console.log('session not alive');
                resolve([]);
            } else {


                // TODO: enhance sorfielf mapping:

                const searchFieldMapping = {
                    versionUpdateDate: 'DocumentVersionUpdateDate',
                    lastUpdateAuthor: 'DocumentVersionLastUpdateAuthor',
                    documentTypeName: 'DocumentTypeName',
                    name: 'DocumentName',
                    length: 'DocumentVersionLength'
                };

                this.tagService.loadTagsRaw()
                    .pipe(
                        map(
                            (tagList) => tagList.map((field) => ({
                                fieldName: TAG_META_DATA_PREFIX + field.uid,
                                faceted: true
                            }))
                        )
                    )
                    .pipe(
                        concatMap(
                            (res) =>
                                this.searchService.advancedSearchDocuments(this.sessionService.sessionToken,
                                page * pageSize, pageSize, searchFieldMapping[sortField], sortDirection, null, -1, false, criterias.concat(res), null, false)
                        )
                    )
                    .subscribe((response: any) => {
                        console.log('loaded results', response);
                        this.onFilesChanged.next(response.rows);
                        this.onFileSelected.next(response.rows[0]);
                        this.onTagsDataChanged.next(this.extractTags(response.allfacetsData));
                        this.onTotalFilesChanged.next(response.results);
                        resolve(response.rows);
                    }, reject);
            }
        });
    }

    reloadFiles(): Promise<any> {
        return this.getFiles(this.sortField, this.sortDirection, 0, this.pageSize, this.query);
    }

    searchInContent(content: string, criterias = []): Promise<any> {
        criterias.push({
            fieldName: 'DocumentBody',
            query: content,
//            filterQuery: true
        });
        return this.getFiles(this.sortField, this.sortDirection, 0, this.pageSize, this.query, criterias);
    }

    searchWithFilters(content: string, filename: string, tagList: Tag[]): Promise<any> {
        const criterias = new Array<Criteria>();
        if (content) {
            criterias.push({
                fieldName: 'DocumentBody',
                query: content,
//            filterQuery: true
            });
        }
        if (filename) {
            criterias.push({
                fieldName: 'DocumentName',
                query: filename,
//            filterQuery: true
            });
        }
        if (tagList.length > 0) {
            tagList.forEach(tag => criterias.push({
                fieldName: TagService.TAG_META_DATA_NAME_PREFIX + tag['_uid'].toString(),
                query: tag['_uid'].toString(),
                metaId: tag['_uid'],
                // filterQuery: true
            }));
        }
        return this.getFiles(this.sortField, this.sortDirection, 0, this.pageSize, this.query, criterias);
    }

    searchInContentWithFacets(content: string, facetFields: string[]): Promise<any> {
        const criterias = facetFields.map(
            (field) => ({
                facetField: field
            })
        );
        return this.searchInContent(content, criterias);
    }

    // extractFacets()

    searchDocumentsByName(searchTerm: string): Observable<SearchResponse> {
        const criterias = [{
            fieldName: 'DocumentName',
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

    public changePage(page, pageSize): Promise<any> {
        return this.getFiles(this.sortField, this.sortDirection, page, pageSize, this.query, this.criterias);
    }

    public changeSort(sortField, sortDirection, page): Promise<any> {
        this.onSortChanged.next(sortField + ' ' + sortDirection);
        return this.getFiles(sortField, sortDirection, page, this.pageSize, this.query, this.criterias);
    }
}
