import {Component, Input, OnInit} from '@angular/core';
import {FileUploadService} from 'app/services/file-upload.service';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {Observable, of} from 'rxjs';
import {ShareDialogComponent} from 'app/main/components/share-dialog/share-dialog.component';
import {MatDialog} from '@angular/material';
import {DMEntityWrapper} from 'app/kimios-client-api/model/dMEntityWrapper';
import {Document as KimiosDocument} from 'app/kimios-client-api/model/document';
import {ConfirmDialogComponent, ConfirmDialogData} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {concatMap, map} from 'rxjs/operators';
import {DMEntity} from 'app/kimios-client-api';
import {EntityCacheService} from 'app/services/entity-cache.service';

@Component({
  selector: 'file-toolbar',
  templateUrl: './file-toolbar.component.html',
  styleUrls: ['./file-toolbar.component.scss']
})
export class FileToolbarComponent implements OnInit {

  @Input()
  documentWrapper: DMEntityWrapper;
  @Input()
  canWrite$: Observable<boolean>;
  @Input()
  hasFullAccess$: Observable<boolean>;
  color = 'primary';
  mode = 'determinate';
  value = 0;
  versionUploading = false;

  constructor(
      private fileUploadService: FileUploadService,
      private documentDetailService: DocumentDetailService,
      public dialog: MatDialog,
      private entityCacheService: EntityCacheService
  ) {
  }

  ngOnInit(): void {
  }

  handleFileInput(target: EventTarget, documentId: number): void {
    if (target['files'] && target['files'][0]) {
      this.versionUploading = true;
      this.fileUploadService.uploadNewVersion(target['files'][0], documentId)
          .subscribe(
              res => {
                if (res['error']) {
                  this.handleError(res['error']);
                } else {
                  this.handleProgress(res);
                }
              },
              err => // console.log(err),
              () => this.versionUploading = false
          );
    }
  }

  private handleProgress(res: { name: string; status: string; message: number } | number | string): void {
    if (typeof res === 'string') {

    } else if (typeof res === 'number') {

    } else {
      this.value = res.message;
    }
  }

  handleFileDownload(documentWrapper: DMEntityWrapper): void {
    this.documentDetailService.downloadDocumentVersion((documentWrapper.dmEntity as KimiosDocument).lastVersionId);
  }

  openShareDialog(): void {
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      data: {
        'uid': this.documentWrapper.dmEntity.uid,
        'name': this.documentWrapper.dmEntity.name
      }
    });
  }

  private handleError(error: any): void {
    const dialogData = <ConfirmDialogData> {
      dialogTitle: '',
      iconLine1: '',
      messageLine1: '',
      messageLine2: ''
    };

    if (error.code === 19) {
      dialogData.dialogTitle = 'Error during upload';
      dialogData.iconLine1 = 'error';
      dialogData.messageLine1 = 'Media type is different.';
      dialogData.messageLine2 = 'Are you sure?';
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });

    dialogRef.afterClosed().pipe(
      concatMap((res: boolean) => res === true ?
        this.confirmNewVersion(error.code, error['dataTransferId']) :
        this.fileUploadService.abortDataTransfer(error.code, error['dataTransferId'])
      ),
    ).subscribe(
    );
  }

  private confirmNewVersion(errorCode: number, dataTransferId: number): Observable<boolean> {
    return this.fileUploadService.confirmDataTransfer(errorCode, dataTransferId).pipe(
      map(res => res != null ? true : false)
    );
  }

  public entityStarIcon(entity: DMEntity): string {
    return (entity.bookmarked != null
      && entity.bookmarked === true) ?
      'star' :
      'star_border';
  }

  handleBookmarkDocument(entity: DMEntity): void {
    of(entity.bookmarked === true).pipe(
      concatMap(res => {
        if (res) {
          return this.documentDetailService.removeBookmark(entity.uid);
        } else {
          return this.documentDetailService.addBookmark(entity.uid);
        }
      }),
      concatMap(() => this.entityCacheService.reloadEntity(entity.uid))
    ).subscribe(
      next => this.documentWrapper.dmEntity = next
    );
  }
}
