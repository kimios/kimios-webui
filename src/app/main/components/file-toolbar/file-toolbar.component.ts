import {Component, Input, OnInit} from '@angular/core';
import {FileUploadService} from 'app/services/file-upload.service';

@Component({
  selector: 'file-toolbar',
  templateUrl: './file-toolbar.component.html',
  styleUrls: ['./file-toolbar.component.scss']
})
export class FileToolbarComponent implements OnInit {

  @Input()
  documentId: number;
  color = 'primary';
  mode = 'determinate';
  value = 0;
  versionUploading = false;

  constructor(
      private fileUploadService: FileUploadService
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
}
