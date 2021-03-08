import {Component, Input, OnInit} from '@angular/core';
import {NotificationService} from 'app/services/notification.service';
import {DocumentUpload} from '../../model/document-upload';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'document-upload-progress',
  templateUrl: './document-upload-progress.component.html',
  styleUrls: ['./document-upload-progress.component.scss']
})
export class DocumentUploadProgressComponent implements OnInit {

  @Input()
  uploadId: string;

  upload: DocumentUpload;

  color = 'primary';
  mode = 'determinate';
  value = 0;
  bufferValue = 1;
  showProgressBar = false;
  upload$: BehaviorSubject<DocumentUpload>;

  constructor(private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.upload = this.notificationService.uploadList.get(this.uploadId);
    this.upload$ = this.notificationService.uploadUpdates.get(this.uploadId);
  }

}
