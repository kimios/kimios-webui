import {AfterViewChecked, Component, ElementRef, Inject, Input, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {Direction} from 'app/main/components/file-detail/file-detail.component';
import {Document as KimiosDocument, DocumentVersion} from 'app/kimios-client-api';
import {formatDate} from '@angular/common';
import {Observable, Subject} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {concatMap, filter, map, tap} from 'rxjs/operators';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'file-preview-wrapper',
  templateUrl: './file-preview-wrapper.component.html',
  styleUrls: ['./file-preview-wrapper.component.scss']
})
export class FilePreviewWrapperComponent implements OnInit, AfterViewChecked {

  @Input()
  documentId: number;
  document: KimiosDocument;
  document$: Observable<KimiosDocument>;
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

  @ViewChild('divWrapper') divWrapper: ElementRef;

  constructor(
      private documentDetailService: DocumentDetailService,
      @Inject(LOCALE_ID) private locale: string,
      private entityCacheService: EntityCacheService,
      private dialog: MatDialog,
      private router: Router
  ) {
    this.documentVersionIds = new Array<number>();
    this.currentVersionId = 0;
    this.documentVersions = new Array<DocumentVersion>();
    this.documentVersionIds = new Array<number>();
  }

  ngOnInit(): void {
    this.document$ = this.documentDetailService.currentDocumentId$.pipe(
      filter(docId => docId != null),
      tap(docId => this.documentId = docId),
      concatMap(documentId => this.entityCacheService.findDocumentInCache(documentId)),
      map(documentWrapper => documentWrapper.dmEntity)
    );

    this.document$.pipe(
      tap(doc => this.document = doc),
      concatMap(doc => this.entityCacheService.findDocumentVersionsInCache(doc.uid)),
      map(versionWithMetaDataValuesList => versionWithMetaDataValuesList
        .map(v => v.documentVersion)),
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

    this.entityCacheService.documentVersionCreated$.pipe(
      filter(docId => docId === this.documentId),
      tap(() => this.handleNewVersion())
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

  ngAfterViewChecked(): void {
    const windowTotalScreen = window.innerHeight;
    // toolbar and browse path are always visible
    this.divWrapper.nativeElement.style.height = windowTotalScreen - 64 - 60  + 'px';
  }

  private handleNewVersion(): void {
    this.entityCacheService.findDocumentVersionsInCache(this.documentId).pipe(
      map(versionWithMetaDataValuesList => versionWithMetaDataValuesList
        .map(v => v.documentVersion)),
      tap(documentVersions => this.documentVersions = documentVersions),
      tap(res => this.previewTitle = this.makePreviewTitle(this.currentVersionId, res)),
      tap(
        res => this.documentVersionIds = this.documentVersions.slice()
          .sort((a, b) => a.modificationDate < b.modificationDate ? -1 : 1)
          .map(version => version.uid)
      ),
      tap(() => {
        if (new RegExp('^\/document\/\\d+\/preview$').test(this.router.url)) {
          this.askForDisplayLastVersion();
        } else {
          const lastVersionId = this.documentVersionIds[this.documentVersionIds.length - 1];
          this.handleVersionPreview(lastVersionId);
        }
      })
    ).subscribe();
  }

  private askForDisplayLastVersion(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle: 'New version available',
        messageLine1: 'Do you want to see it?'
      }
    });

    dialogRef.afterClosed().pipe(
      filter(res => res === true),
      tap(() => {
        const lastVersionId = this.documentVersionIds[this.documentVersionIds.length - 1];
        this.handleVersionPreview(lastVersionId);
      })
    ).subscribe();
  }
}
