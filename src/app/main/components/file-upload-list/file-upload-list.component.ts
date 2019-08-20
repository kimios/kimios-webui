import {Component, OnInit} from '@angular/core';
import {FileUploadService} from 'app/services/file-upload.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Tag} from 'app/main/model/tag';

@Component({
  selector: 'file-upload-list',
  templateUrl: './file-upload-list.component.html',
  styleUrls: ['./file-upload-list.component.scss']
})
export class FileUploadListComponent implements OnInit {

  filesUploading: string[];
  progress: Map<string, BehaviorSubject<{ name: string, status: string, message: number }>>;
  filesUploaded: Map<string, Observable<Tag[]>>;

  constructor(private fileUploadService: FileUploadService) {
    this.filesUploading = Array.from(fileUploadService.filesProgress.keys());
    console.log('FileUploadListComponent() with this.filesUploading:');
    console.log(this.filesUploading);
    this.progress = this.fileUploadService.filesProgress;
    this.filesUploaded = this.fileUploadService.filesUploaded;
  }

  ngOnInit(): void {
  }

}
