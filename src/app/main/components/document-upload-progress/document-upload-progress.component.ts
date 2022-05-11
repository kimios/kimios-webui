import {Component, Input, OnInit} from '@angular/core';
import {NotificationService} from 'app/services/notification.service';
import {DocumentUpload} from '../../model/document-upload';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {FuseSidebarService} from '@fuse/components/sidebar/sidebar.service';

@Component({
  selector: 'document-upload-progress',
  templateUrl: './document-upload-progress.component.html',
  styleUrls: ['./document-upload-progress.component.scss']
})
export class DocumentUploadProgressComponent implements OnInit {

  @Input()
  uploadId: string;

  upload: DocumentUpload;

  color = 'accent';
  mode = 'determinate';
  value = 0;
  bufferValue = 1;
  showProgressBar = false;
  upload$: BehaviorSubject<DocumentUpload>;

  constructor(
      private notificationService: NotificationService,
      private router: Router,
      private _fuseSidebarService: FuseSidebarService
  ) {
  }

  ngOnInit(): void {
    this.upload = this.notificationService.uploadList.get(this.uploadId);
    this.upload$ = this.notificationService.uploadUpdates.get(this.uploadId);
  }

  goToDoc(id: number): void {
    if (this.upload.isSuccessful()) {
      DocumentUtils.navigateToFile(this.router, id);
      this._fuseSidebarService.getSidebar('quickPanel').close();
    }
  }
}
