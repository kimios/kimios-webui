import {Component, ElementRef, Inject, Input, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormBuilder, FormControl} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent} from '@angular/material';
import {concatMap, map, startWith, tap} from 'rxjs/operators';
import {DocumentService, DocumentVersionService, SecurityService} from 'app/kimios-client-api';
import {ActivatedRoute} from '@angular/router';
import {SessionService} from 'app/services/session.service';
import {TagService} from 'app/services/tag.service';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {SearchEntityService} from 'app/services/searchentity.service';
import {DocumentRefreshService} from 'app/services/document-refresh.service';
import {Location} from '@angular/common';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {DMEntityWrapper} from '../../../kimios-client-api/model/dMEntityWrapper';

@Component({
  selector: 'file-detail-tags',
  templateUrl: './file-detail-tags.component.html',
  styleUrls: ['./file-detail-tags.component.scss']
})
export class FileDetailTagsComponent implements OnInit {

  @Input()
  documentWrapper: DMEntityWrapper;
  canWrite$: Observable<boolean>;
  documentTags$: BehaviorSubject<Array<string>>;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  allTagsKey$: Observable<Array<string>>;
  allTags: Map<string, number>;
  filteredTags$: Observable<Array<string>>;
  selectedTag$: Subject<string>;
  removedTag$: Subject<string>;
  selectedTag: string;
  removedTag: string;
  createdTagName: string;
  loading$: Observable<boolean>;

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
    private fb: FormBuilder,
    @Inject(LOCALE_ID) private locale: string,
    private entityCacheService: EntityCacheService
  ) {
    this.documentTags$ = new BehaviorSubject<Array<string>>([]);
    this.selectedTag$ = new Subject<string>();
    this.removedTag$ = new Subject<string>();
    this.canWrite$ = new Observable<boolean>();
    this.loading$ = of(true);
  }

  ngOnInit(): void {
    this.canWrite$ = of(this.documentWrapper.canWrite);

    this.allTagsKey$ = this.searchEntityService.retrieveAllTags()
      .pipe(
        tap(res => this.allTags = res),
        tap(() => this.filteredTags$ = this.initFilteredTags()),
        map(res => Array.from(res.keys()))
      );

    this.allTagsKey$
      .pipe(
        tap(res => this.loading$ = of(true)),
        // tap(res => this.allTags = res),
        concatMap(res => this.entityCacheService.findDocumentInCache(this.documentWrapper.dmEntity.uid)),
        tap(res => this.documentDetailService.currentVersionId.next((res.dmEntity as KimiosDocument).lastVersionId)),
        tap(res => this.documentWrapper.dmEntity = (res.dmEntity as KimiosDocument)),
        tap(res => this.loading$ = of(false)),
        tap(res => console.dir(res)),
        tap(res => this.documentTags$.next((res.dmEntity as KimiosDocument).tags)),
      ).subscribe();

    this.selectedTag$
      .pipe(
        tap(next => this.selectedTag = next),
        concatMap(next => this.documentService.updateDocumentTag(
          this.sessionService.sessionToken,
          this.documentWrapper.dmEntity.uid,
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
          this.documentWrapper.dmEntity.uid,
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
  }

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
}
