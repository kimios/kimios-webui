import {Component, Input, OnInit} from '@angular/core';
import {FileUploadService} from 'app/services/file-upload.service';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {Observable} from 'rxjs';
import {ShareDialogComponent} from 'app/main/components/share-dialog/share-dialog.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'file-toolbar',
  templateUrl: './file-toolbar.component.html',
  styleUrls: ['./file-toolbar.component.scss']
})
export class FileToolbarComponent implements OnInit {

  @Input()
  document: KimiosDocument;
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
      public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
  }

  handleFileInput(target: EventTarget, documentId: number): void {
    if (target['files'] && target['files'][0]) {
      this.versionUploading = true;
      this.fileUploadService.uploadNewVersion(target['files'][0], documentId)
          .subscribe(
              res => this.handleProgress(res),
              err => console.log(err),
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

  handleFileDownload(versionId: number): void {
    this.documentDetailService.downloadDocumentVersion(versionId);
  }

  openShareDialog(): void {
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      data: {
        'uid': this.document.uid,
        'name': this.document.name
      }
    });
  }
}
