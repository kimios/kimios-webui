import {Component, Input, OnInit} from '@angular/core';
import {FileUploadService} from 'app/services/file-upload.service';
import {Document as KimiosDocument, SecurityService} from 'app/kimios-client-api';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {Observable} from 'rxjs';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'file-toolbar',
  templateUrl: './file-toolbar.component.html',
  styleUrls: ['./file-toolbar.component.scss']
})
export class FileToolbarComponent implements OnInit {

  @Input()
  document: KimiosDocument;
  color = 'primary';
  mode = 'determinate';
  value = 0;
  versionUploading = false;
  canWrite$: Observable<boolean>;

  constructor(
      private fileUploadService: FileUploadService,
      private documentDetailService: DocumentDetailService,
      private sessionService: SessionService,
      private securityService: SecurityService
  ) {
    this.canWrite$ = new Observable<boolean>();
  }

  ngOnInit(): void {
    this.canWrite$ = this.securityService.canWrite(this.sessionService.sessionToken, this.document.uid);
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
}
