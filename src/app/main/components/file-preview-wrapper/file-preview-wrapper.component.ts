import {Component, Inject, Input, LOCALE_ID, OnInit} from '@angular/core';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {Direction} from 'app/main/components/file-detail/file-detail.component';
import {Document as KimiosDocument, DocumentVersion} from 'app/kimios-client-api';
import {formatDate} from '@angular/common';
import {Observable, of, Subject} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {concatMap, filter, switchMap, tap} from 'rxjs/operators';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'file-preview-wrapper',
  templateUrl: './file-preview-wrapper.component.html',
  styleUrls: ['./file-preview-wrapper.component.scss']
})
export class FilePreviewWrapperComponent implements OnInit {

  @Input()
  documentId: number;
  document: KimiosDocument;
  documentVersions: Array<DocumentVersion>;
  documentVersionIds: Array<number>;
  allTags: Map<string, number>;
  filteredTags$: Observable<Array<string>>;
  selectedTag$: Subject<string>;
  removedTag$: Subject<string>;
  selectedTag: string;
  removedTag: string;
  createdTagName: string;
  hasFullAccess$: Observable<boolean>;
  previewTitle: string;
  currentVersionId: number;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  loading$: Observable<boolean>;
  spinnerColor = 'primary';
  spinnerMode = 'indeterminate';

  constructor(
      private documentDetailService: DocumentDetailService,
      @Inject(LOCALE_ID) private locale: string,
      private entityCacheService: EntityCacheService,
      private route: ActivatedRoute
  ) {
    this.documentVersionIds = new Array<number>();
    this.currentVersionId = 0;
    this.documentVersions = new Array<DocumentVersion>();
    this.documentVersionIds = new Array<number>();
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.documentId = Number(params.get('documentId'));
        return of(this.documentId);
      }),
      concatMap(documentId => this.entityCacheService.findDocumentInCache(documentId)),
      tap(doc => this.document = doc),
      concatMap(doc => this.entityCacheService.findDocumentVersionsInCache(doc.uid)),
      tap(documentVersions => this.documentVersions = documentVersions),
      tap(res => this.previewTitle = this.makePreviewTitle(this.currentVersionId, res)),
      tap(
        res => this.documentVersionIds = this.documentVersions.slice()
          .sort((a, b) => a.modificationDate < b.modificationDate ? -1 : 1)
          .map(version => version.uid)
      )
    ).subscribe();

    this.documentDetailService.currentVersionId.pipe(
      filter(currentVersionId => currentVersionId != null),
      tap(currentVersionId => this.currentVersionId = currentVersionId)
    ).subscribe();
  }

  currentVersionIsLast(): boolean {
    return (this.documentVersionIds.indexOf(this.documentDetailService.currentVersionId.getValue())
        === this.documentVersionIds.length - 1);
  }

  currentVersionIsFirst(): boolean {
    return (this.documentVersionIds.indexOf(this.documentDetailService.currentVersionId.getValue()) === 0);
  }

  handleVersionPreviewNextOrPrev(direction: Direction): void {
    if (
        (direction === Direction.PREVIOUS && this.currentVersionIsFirst())
        || (direction === Direction.NEXT && this.currentVersionIsLast())
    ) {
      return;
    }
    const uid = this.computeVersionUidToDisplay(this.documentDetailService.currentVersionId.getValue(), this.documentVersions, direction);
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

  handleVersionPreview(uid: number): void {
    this.previewTitle = this.makePreviewTitle(uid, this.documentVersions);
    this.documentDetailService.currentVersionId.next(uid);
  }

  makePreviewTitle(versionId: number, versions: Array<DocumentVersion>): string {
    let version: DocumentVersion;
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
}
