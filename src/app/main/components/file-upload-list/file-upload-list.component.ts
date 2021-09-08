import {Component, OnInit} from '@angular/core';
import {FileUploadService} from 'app/services/file-upload.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Tag} from 'app/main/model/tag';
import {Document as KimiosDocument} from 'app/kimios-client-api';

@Component({
  selector: 'file-upload-list',
  templateUrl: './file-upload-list.component.html',
  styleUrls: ['./file-upload-list.component.scss']
})
export class FileUploadListComponent implements OnInit {

  progress: Map<string, BehaviorSubject<{ name: string, status: string, message: string }>>;
  filesUploaded: Map<string, Observable<string[]>>;
  private filesUploadedDocuments: Map<string, BehaviorSubject<KimiosDocument>>;

  constructor(private fileUploadService: FileUploadService) {

    this.progress = this.fileUploadService.filesProgress;
    this.filesUploaded = this.fileUploadService.filesUploaded;
    this.filesUploadedDocuments = this.fileUploadService.filesUploadedDocuments;
  }

  ngOnInit(): void {
  }

}
