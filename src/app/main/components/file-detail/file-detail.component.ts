import {Component, ElementRef, Inject, Input, LOCALE_ID, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {Document as KimiosDocument, DocumentService, DocumentVersion, DocumentVersionService, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {TagService} from 'app/services/tag.service';
import {concatMap, map, startWith, tap} from 'rxjs/operators';
import {Tag} from 'app/main/model/tag';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent} from '@angular/material';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {SearchEntityService} from 'app/services/searchentity.service';
import {DocumentRefreshService} from 'app/services/document-refresh.service';
import {ActivatedRoute} from '@angular/router';
import { Location, formatDate } from '@angular/common';

export enum Direction {
    NEXT = 1,
    PREVIOUS = -1
}

@Component({
  selector: 'file-detail',
  templateUrl: './file-detail.component.html',
  styleUrls: ['./file-detail.component.scss']
})
export class FileDetailComponent implements OnInit, OnDestroy {

    @Input()
    documentId: number;
    document: KimiosDocument;
    documentData$: Observable<KimiosDocument>;
    documentVersions$: Observable<Array<DocumentVersion>>;
    documentVersions: Array<DocumentVersion>;
    documentVersionIds: Array<number>;
    allTags$: Observable<Tag[]>;
    allTags: Tag[];
    documentTags$: BehaviorSubject<Tag[]>;
    filteredTags$: Observable<Tag[]>;
    selectedTag$: Subject<Tag>;
    removedTag$: Subject<Tag>;
    selectedTag: Tag;
    removedTag: Tag;
    createdTagName: string;
    canWrite$: Observable<boolean>;
    hasFullAccess$: Observable<boolean>;
    previewTitle: string;
    currentVersionId: number;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    tagCtrl = new FormControl();
    loading$: Observable<boolean>;
    spinnerColor = 'primary';
    spinnerMode = 'indeterminate';


    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(
        private route: ActivatedRoute,
        private documentService: DocumentService,
        private documentVersionService: DocumentVersionService,
        private sessionService: SessionService,
        private tagService: TagService,
        private documentDetailService: DocumentDetailService,
        private searchEntityService: SearchEntityService,
        private documentRefreshService: DocumentRefreshService,
        private securityService: SecurityService,
        private location: Location,
        @Inject(LOCALE_ID) private locale: string
    ) {
        this.allTags$ = this.tagService.loadTags()
            .pipe(
                map(res => res.map(v => new Tag(v.name, v.uid))),
                tap(res => this.allTags = res)
            );
        this.documentTags$ = new BehaviorSubject<Tag[]>(new Array<Tag>());
        this.selectedTag$ = new Subject<Tag>();
        this.removedTag$ = new Subject<Tag>();
        this.canWrite$ = new Observable<boolean>();
        this.hasFullAccess$ = new Observable<boolean>();
        this.loading$ = of(true);
        this.previewTitle = '';
        this.currentVersionId = 0;
        this.documentVersions = new Array<DocumentVersion>();
        this.documentVersionIds = new Array<number>();
    }

    ngOnInit(): void {
        this.documentId = +this.route.snapshot.paramMap.get('documentId');
        this.canWrite$ = this.securityService.canWrite(this.sessionService.sessionToken, this.documentId);
        this.hasFullAccess$ = this.securityService.hasFullAccess(this.sessionService.sessionToken, this.documentId);

        this.documentData$ = this.allTags$
            .pipe(
                tap(res => this.loading$ = of(true)),
                // tap(res => this.allTags = res),
                concatMap(res => this.documentService.getDocument(this.sessionService.sessionToken, this.documentId)),
                tap(res => this.currentVersionId = res.lastVersionId),
                tap(res => this.document = res),
                tap(res => this.loading$ = of(false))
            );

        this.documentDetailService.retrieveDocumentTags(this.documentId)
            .subscribe(
                next => this.documentTags$.next(next)
            );

        this.documentVersions$ = this.initDocumentVersions();

        this.filteredTags$ = this.initFilteredTags();

        this.selectedTag$
            .pipe(
                tap(next => this.selectedTag = next),
                concatMap(next => this.documentService.updateDocumentTag(
                    this.sessionService.sessionToken,
                    this.documentId,
                    next.uid,
                    true
                    )
                )
            )
            .subscribe(
                next => this.documentTags$.next(this.documentTags$.getValue().concat(this.selectedTag))
            );

        this.removedTag$
            .pipe(
                tap(next => this.removedTag = next),
                concatMap(next => this.documentService.updateDocumentTag(
                    this.sessionService.sessionToken,
                    this.documentId,
                    next.uid,
                    false
                    )
                )
            )
            .subscribe(
                next => {
                    const tags = this.documentTags$.getValue();
                    let tagIndex;
                    tags.forEach((value, index) => {
                        if (value.uid === this.removedTag.uid) {
                            tagIndex = index;
                        }
                    });
                    if (tagIndex !== null && tagIndex !== undefined) {
                        tags.splice(tagIndex, 1);
                        this.documentTags$.next(tags);
                    }
                }
            );

        this.documentTags$.pipe(
            tap(res => this.searchEntityService.reloadTags())
        ).subscribe();

        this.documentRefreshService.needRefresh.subscribe(
            res => res && res === this.documentId ? this.reloadDocument() : console.log('no need to refresh')
        );
    }

    initDocumentVersions(): Observable<Array<DocumentVersion>> {
        return this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, this.documentId)
            .pipe(
                map(
                    res => res.sort((a, b) => a.creationDate < b.creationDate ? 1 : -1)
                ),
                tap(
                    res => this.previewTitle =
                        (res instanceof Array) ?
                            (res.length === 0) ?
                                'Unique version, created on ' + formatDate(this.document.creationDate, 'longDate', this.locale) :
                                this.makePreviewTitle(this.currentVersionId, res) :
                            'Unique version, created on ' + formatDate(this.document.creationDate, 'longDate', this.locale)
                ),
                tap(
                    res => this.documentVersions = res
                ),
                tap(
                    res => this.documentVersionIds = this.documentVersions.slice()
                        .sort((a, b) => a.modificationDate < b.modificationDate ? -1 : 1)
                        .map(version => version.uid)
                )
            );
    }

    makePreviewTitle(versionId: number, versions: Array<DocumentVersion>): string {
        let version = versions[versions.length - 1];
        const sortedVersions = versions.slice().sort((a, b) => (a.modificationDate < b.modificationDate) ? -1 : 1);
        switch (versionId) {
            case null:
            case 0:
                version = sortedVersions[sortedVersions.length - 1];
                break;

            case -1:
                version = sortedVersions[0];
                break;

            default:
                version = sortedVersions.filter(v => v.uid === versionId)[0];
        }

        let title = '';
        if (sortedVersions.length === 1) {
            title = 'Unique version, created on ' + formatDate(version.modificationDate, 'longDate', this.locale);
        } else {
            const versionIndexStr = (sortedVersions.indexOf(version) + 1) + ' of ' + (sortedVersions.length);
            title = 'Version '
            + ((version.customVersion !== null) ?
                version.customVersion + '(' + versionIndexStr + ')' :
                versionIndexStr);
        }

        return title;
    }

    ngOnDestroy(): void {
        this.documentTags$.unsubscribe();
        this.selectedTag$.unsubscribe();
        this.removedTag$.unsubscribe();
        // this.documentRefreshService.needRefresh.unsubscribe();
    }

    private initFilteredTags(): Observable<Tag[]> {
        return this.tagCtrl.valueChanges.pipe(
            startWith(null),
            map((tag: (string|Tag) | null) =>
                tag ?
                    this._filterTags(tag instanceof Tag ? tag.name : tag) :
                    this.allTags
                        .filter(t => !this.isTagSetOnDocument(t))
                        .slice()
            )
        );
    }

    private isTagSetOnDocument(tag: Tag): boolean {
        return this.documentTags$.getValue().filter(
            value => value.uid === tag.uid
        ).length > 0;
    }

    private _filterTags(value: string): Tag[] {
        const filterValue = value.toLowerCase();

        return this.allTags.filter(tag => !this.isTagSetOnDocument(tag) && tag.name.toLowerCase().includes(filterValue));
    }

    private extractTagsFromAddonDatas(addonDataJsonString: string): Tag[] {
        const addonData = JSON.parse(addonDataJsonString);
        const tags = new Array<Tag>();
        const allTagsMap = new Map<number, Tag>();
        this.allTags.forEach(tag => allTagsMap.set(tag.uid, tag));
        if (addonData['entityMetaValues'] && Array.isArray(addonData['entityMetaValues'])) {
            Array.from(addonData['entityMetaValues']).forEach(
                metaValue => {
                    if (metaValue['meta']
                        && metaValue['meta']['uid']
                        && allTagsMap.get(metaValue['meta']['uid'])
                        && metaValue['meta']['name']
                        && metaValue['value']
                        && metaValue['value'] == metaValue['meta']['uid']) {
                        tags.push(new Tag(
                            metaValue['meta']['name']
                                .toLocaleUpperCase()
                                .replace(new RegExp('^' + TagService.TAG_NAME_PREFIX), ''),
                            metaValue['meta']['uid']
                        ));
                    }
                }
            );
        }
        return tags;
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        const tag: any = event.option.value;
        this.selectedTag$.next(tag);
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    remove(tag: Tag): void {
        this.removedTag$.next(tag);
    }

    createAndAddTag($event: MatChipInputEvent): void {
        if (!this.matAutocomplete.isOpen) {
            const input = $event.input;
            const value = $event.value;

            // Add our tag
            if ((value || '').trim()) {
// ask to tagService to create the tag (the meta on the right document type)
                this.createdTagName = value;
                this.tagService.createTag(value)
                    .pipe(
                        // concatMap(next => this.tagService.loadTags()),
                        // map(res => res.map(v => new Tag(v.name, v.uid)))
                        concatMap(next => this.allTags$)
                    )
                    .subscribe(
                        next => {
                            const newTag = next.filter(tag => tag.name === this.createdTagName)[0];
                            if (newTag) {
                                this.selectedTag$.next(newTag);
                                this.filteredTags$ = this.initFilteredTags();

                            }
                        });

            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            this.tagCtrl.setValue(null);
        }
    }

    handleVersionDownload(versionId: number): void {
        this.documentDetailService.downloadDocumentVersion(versionId);
    }

    private reloadDocument(): void {
        this.documentData$ = this.allTags$
            .pipe(
                // tap(res => this.allTags = res),
                concatMap(res => this.documentService.getDocument(this.sessionService.sessionToken, this.documentId)),
                tap(res => this.document = res)
            );

        this.documentDetailService.retrieveDocumentTags(this.documentId)
            .subscribe(
                next => this.documentTags$.next(next)
            );

        this.documentVersions$ = this.initDocumentVersions();

        this.filteredTags$ = this.initFilteredTags();
    }

    goBack($event: MouseEvent): void {
        $event.stopPropagation();
        $event.preventDefault();
        this.location.back();
    }

    handleVersionPreview(uid: number): void {
        this.previewTitle = this.makePreviewTitle(uid, this.documentVersions);
        this.currentVersionId = uid;
    }

    handleVersionPreviewNextOrPrev(direction: Direction): void {
        if (
            (direction === Direction.PREVIOUS && this.currentVersionIsFirst())
            || (direction === Direction.NEXT && this.currentVersionIsLast())
        ) {
            return;
        }
        const uid = this.computeVersionUidToDisplay(this.currentVersionId, this.documentVersions, direction);
        this.handleVersionPreview(uid);
    }

    private computeVersionUidToDisplay(currentVersionId: number, documentVersions: Array<DocumentVersion>, direction: Direction): number {
        let curVersionIndex = -1;
        documentVersions = documentVersions.slice().sort((a, b) => a.modificationDate < b.modificationDate ? -1 : 1);
        documentVersions.forEach((version, index) => {
            if (version.uid === currentVersionId) {
                curVersionIndex = index;
            }
        });

        const nbVersions = documentVersions.length;
        let versionSelected: DocumentVersion;
        if (direction === Direction.NEXT && curVersionIndex < (nbVersions - 1)) {
                versionSelected = documentVersions[curVersionIndex + 1];
        } else {
            if (direction === Direction.PREVIOUS && curVersionIndex > 0) {
                versionSelected = documentVersions[curVersionIndex - 1];
            }
        }

        return versionSelected.uid;
    }

    currentVersionIsLast(): boolean {
        return (this.documentVersionIds.indexOf(this.currentVersionId) === this.documentVersionIds.length - 1);
    }

    currentVersionIsFirst(): boolean {
        return (this.documentVersionIds.indexOf(this.currentVersionId) === 0);
    }
}
