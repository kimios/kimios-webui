import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import { Location } from '@angular/common';

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
        private location: Location
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
    }

    ngOnInit(): void {
        this.documentId = +this.route.snapshot.paramMap.get('documentId');
        this.canWrite$ = this.securityService.canWrite(this.sessionService.sessionToken, this.documentId);
        this.hasFullAccess$ = this.securityService.hasFullAccess(this.sessionService.sessionToken, this.documentId);

        this.documentData$ = this.allTags$
            .pipe(
                concatMap(res => {
                    this.loading$ = of(true);
                    return res;
                }),
                // tap(res => this.allTags = res),
                concatMap(res => this.documentService.getDocument(this.sessionService.sessionToken, this.documentId)),
                tap(res => this.document = res),
                tap(res => this.loading$ = of(false))
            );

        this.documentDetailService.retrieveDocumentTags(this.documentId)
            .subscribe(
                next => this.documentTags$.next(next)
            );

        this.documentVersions$ = this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, this.documentId)
            .map(
                res => res.sort((a, b) => a.creationDate < b.creationDate ? 1 : -1)
            );

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

        this.documentVersions$ = this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, this.documentId)
            .map(
                res => res.sort((a, b) => a.creationDate < b.creationDate ? 1 : -1)
            );

        this.filteredTags$ = this.initFilteredTags();
    }

    goBack($event: MouseEvent): void {
        $event.stopPropagation();
        $event.preventDefault();
        this.location.back();
    }
}
