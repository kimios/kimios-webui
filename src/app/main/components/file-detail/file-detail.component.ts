import {AfterViewChecked, Component, ElementRef, Inject, Input, LOCALE_ID, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {Document as KimiosDocument, DocumentService, DocumentVersion, DocumentVersionService, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {TagService} from 'app/services/tag.service';
import {concatMap, map, startWith, tap} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormBuilder, FormControl} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatChipInputEvent} from '@angular/material';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {SearchEntityService} from 'app/services/searchentity.service';
import {DocumentRefreshService} from 'app/services/document-refresh.service';
import {ActivatedRoute} from '@angular/router';
import {formatDate, Location} from '@angular/common';

export enum Direction {
    NEXT = 1,
    PREVIOUS = -1
}

@Component({
  selector: 'file-detail',
  templateUrl: './file-detail.component.html',
  styleUrls: ['./file-detail.component.scss']
})
export class FileDetailComponent implements OnInit, OnDestroy, AfterViewChecked {

    @Input()
    documentId: number;
    document: KimiosDocument;
    documentData$: Observable<KimiosDocument>;
    documentVersions$: Observable<Array<DocumentVersion>>;
    documentVersions: Array<DocumentVersion>;
    documentVersionIds: Array<number>;
    allTagsKey$: Observable<Array<string>>;
    allTags: Map<string, number>;
    documentTags$: BehaviorSubject<Array<string>>;
    filteredTags$: Observable<Array<string>>;
    selectedTag$: Subject<string>;
    removedTag$: Subject<string>;
    selectedTag: string;
    removedTag: string;
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
    @ViewChild('filePreviewDiv') filePreviewDivElement: ElementRef;
    @ViewChild('filePreview') filePreviewElement: ElementRef;

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
        private fb: FormBuilder,
        @Inject(LOCALE_ID) private locale: string
    ) {
        this.allTagsKey$ = this.searchEntityService.retrieveAllTags()
            .pipe(
                tap(res => this.allTags = res),
                map(res => Array.from(res.keys()))
            );
        this.documentTags$ = new BehaviorSubject<Array<string>>([]);
        this.selectedTag$ = new Subject<string>();
        this.removedTag$ = new Subject<string>();
        this.canWrite$ = new Observable<boolean>();
        this.hasFullAccess$ = new Observable<boolean>();
        this.loading$ = of(true);
        this.previewTitle = '';
        this.currentVersionId = 0;
        this.documentVersions = new Array<DocumentVersion>();
        this.documentVersionIds = new Array<number>();
    }

    ngOnInit(): void {
        this.documentId = Number(this.route.snapshot.paramMap.get('documentId'));
        this.canWrite$ = this.securityService.canWrite(this.sessionService.sessionToken, this.documentId);
        this.hasFullAccess$ = this.securityService.hasFullAccess(this.sessionService.sessionToken, this.documentId);

        this.documentData$ = this.allTagsKey$
            .pipe(
                tap(res => this.loading$ = of(true)),
                // tap(res => this.allTags = res),
                concatMap(res => this.documentService.getDocument(this.sessionService.sessionToken, this.documentId)),
                tap(res => this.currentVersionId = res.lastVersionId),
                tap(res => this.document = res),
                tap(res => this.loading$ = of(false)),
                tap(res => this.documentTags$.next(res.tags)),
            );

        this.documentVersions$ = this.initDocumentVersions();

        this.filteredTags$ = this.initFilteredTags();

        this.selectedTag$
            .pipe(
                tap(next => this.selectedTag = next),
                concatMap(next => this.documentService.updateDocumentTag(
                    this.sessionService.sessionToken,
                    this.documentId,
                    next,
                    true
                    )
                )
            )
            .subscribe(
                next => this.documentTags$.next(this.documentTags$.getValue().concat(this.selectedTag))
            );

        this.removedTag$
            .pipe(
                concatMap(next => combineLatest(of(next), this.documentService.updateDocumentTag(
                    this.sessionService.sessionToken,
                    this.documentId,
                    next,
                    false
                    )
                ))
            )
            .subscribe(
                ([removedTag, res]) => {
                    const tags = this.documentTags$.getValue();
                    const tagIndex = tags.indexOf(removedTag);
                    if (tagIndex !== -1) {
                        tags.splice(tagIndex, 1);
                        this.documentTags$.next(tags);
                    }
                }
            );

       /* this.documentTags$.pipe(
            tap(res => this.searchEntityService.reloadTags())
        ).subscribe();*/

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

    private initFilteredTags(): Observable<Array<string>> {
        return this.tagCtrl.valueChanges.pipe(
            startWith(null),
            map((tag: string | null) =>
                tag ?
                    this._filterTags(tag) :
                    Array.from(this.allTags.keys())
                        .filter(t => !this.isTagSetOnDocument(t))
                        .slice()
            )
        );
    }

    private isTagSetOnDocument(tag: string): boolean {
        return this.documentTags$.getValue().includes(tag);
    }

    private _filterTags(value: string): Array<string> {
        const filterValue = value.toLowerCase();

        return Array.from(this.allTags.keys()).filter(tag => !this.isTagSetOnDocument(tag) && tag.toLowerCase().includes(filterValue));
    }

    /*private extractTagsFromAddonDatas(addonDataJsonString: string): Tag[] {
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
    }*/

    selected(event: MatAutocompleteSelectedEvent): void {
        const tag: any = event.option.value;
        this.selectedTag$.next(tag);
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    remove(tag: string): void {
        this.removedTag$.next(tag);
    }

    createAndAddTag($event: MatChipInputEvent): void {
        if (!this.matAutocomplete.isOpen) {
            const input = $event.input;
            const value = $event.value;

            // Add our tag
            if ((value || '').trim()) {
                this.selectedTag$.next(value);
                // this.filteredTags$ = this.initFilteredTags();
            }
            // Reset the input value
            if (input) {
                input.value = '';
            }
            this.tagCtrl.setValue(null);
        }
        // this.tagInputTrigger.closePanel();
    }

    handleVersionDownload(versionId: number): void {
        this.documentDetailService.downloadDocumentVersion(versionId);
    }

    private reloadDocument(): void {
        this.documentData$ = this.allTagsKey$
            .pipe(
                // tap(res => this.allTags = res),
                concatMap(res => this.documentService.getDocument(this.sessionService.sessionToken, this.documentId)),
                tap(res => this.document = res),
                tap(res => this.documentTags$.next(res.tags))
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

    addTag(tag: string): void {
        console.log('addTag() ' + tag);
        this.selectedTag$.next(tag);
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    addTagOnInput(): void {
        if (this.matAutocomplete.isOpen) {
            const input = this.tagInput.nativeElement;
            const value = this.tagCtrl.value;

            // Add our tag
            if ((value || '').trim()) {
                this.selectedTag$.next(value);
                // this.filteredTags$ = this.initFilteredTags();
            }
            // Reset the input value
            if (input) {
                input.value = '';
            }
            this.tagCtrl.setValue(null);
        }
    }

    ngAfterViewChecked(): void {
        this.filePreviewDivElement.nativeElement.style.height = this.filePreviewElement.nativeElement.offsetHeight + 'px';
    }
}
