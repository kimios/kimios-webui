import {Component, Input, OnInit} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {FileUploadService} from 'app/services/file-upload.service';
import {map, mergeMap, tap} from 'rxjs/operators';

export const KIMIOS_CURRENT_UPLOADING_FILE = 'KIMIOS_CURRENT_UPLOADING_FILE';

@Component({
  selector: 'file-upload-progress',
  templateUrl: './file-upload-progress.component.html',
  styleUrls: ['./file-upload-progress.component.scss']
})
export class FileUploadProgressComponent implements OnInit {
    @Input() uploadingFileName: string;
    file: Subject<string>;
    progress: Observable<{ name: string, status: string, message: number } | number | string >;
    color = 'primary';
    mode = 'determinate';
    value = 0;
    bufferValue = 1;
    showProgressBar = false;
    showComponent = false;
    messageDisplayed = '';
    uploadStatus: 'ongoing' | 'done';

  constructor(private fileUploadService: FileUploadService) {
    this.file = new Subject<string>();
  }

  ngOnInit(): void {
    if (this.uploadingFileName === undefined
        || this.uploadingFileName === null
        || this.uploadingFileName === '') {
      this.fileUploadService.uploadingFile
          .pipe(
              map(res => {
                if (res) {
                    this.uploadingFileName = res.name;
                  return res.name;
                } else {
                  return ;
                }
              })
          )
          .subscribe(
          (res) => this.file.next(res),
              (error) => console.log(error),
              () => console.log('no file')
      );
    } else {
      this.file.next(this.uploadingFileName);
    }
    this.file.pipe(
        // tap(
        //     res => {
        //         this.hide = true;
        //         this.initProgressBar();
        //         this.hide = false;
        //     }
        // ),
        mergeMap(
            res => res ? this.fileUploadService.filesProgress.get(res) : of()
        )
    ).subscribe(
        res => {
          this.progress = of(res);
          console.log('in FileUploadProgressComponent');
          console.log(res);
          this.value = res.message ? res.message : this.value;
          if (this.value === -1) {
              this.initProgressBar();
              this.showProgressBar = true;
              this.showComponent = true;
          } else {
              if (this.value === 100) {
                  this.uploadStatus = 'done';
                  this.messageDisplayed = 'uploaded: ' + this.uploadingFileName;
                  this.showProgressBar = false;
              }
          }
        }
    );

  }

    initProgressBar(): void {
        console.log('initProgressBar()');
        this.messageDisplayed = 'uploading: ' + this.uploadingFileName;
        this.uploadStatus = 'ongoing';
        this.value = 0;
    }
}
