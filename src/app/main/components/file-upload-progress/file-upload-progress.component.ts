import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {FileUploadService} from 'app/services/file-upload.service';
import {filter, map, mergeMap} from 'rxjs/operators';

export const KIMIOS_CURRENT_UPLOADING_FILE = 'KIMIOS_CURRENT_UPLOADING_FILE';

@Component({
  selector: 'file-upload-progress',
  templateUrl: './file-upload-progress.component.html',
  styleUrls: ['./file-upload-progress.component.scss']
})
export class FileUploadProgressComponent implements OnInit {
    uploadingFileName: string;
    file: Subject<string>;
    color = 'primary';
    mode = 'determinate';
    value = 0;
    bufferValue = 1;
    showProgressBar = false;
    showComponent = false;
    messageDisplayed: BehaviorSubject<string>;
    uploadStatus: 'uploading' | 'nothing' ;
    uploadsHistory: Map<string, { name: string, status: string, message: string }>;

  constructor(private fileUploadService: FileUploadService) {
    this.file = new Subject<string>();
    this.messageDisplayed = new BehaviorSubject<string>('');
    this.uploadsHistory = new Map<string, {name: string, status: string, message: string}>();
  }

  ngOnInit(): void {
      if (this.uploadingFileName === undefined
          || this.uploadingFileName === null
          || this.uploadingFileName === '') {
          this.fileUploadService.uploadingFile
              .pipe(
                  map(res => {
                      if (res) {
                          this.uploadingFileName = res;
                          return res;
                      } else {
                          return;
                      }
                  })
              )
              .subscribe(
                  (res) => res !== null && res !== undefined ? this.file.next(res) : console.log('undefined'),
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
          filter(res => res !== null && res !== undefined),
          mergeMap(
              res => this.fileUploadService.filesProgress.get(res)
          )
      ).subscribe(
          res => {

              console.log('in FileUploadProgressComponent');
              console.log(res);
              /*this.value = res.message ? res.message : this.value;
              if (this.value === -1) {
                  this.initProgressBar(res.name);
                  this.showProgressBar = true;
                  this.showComponent = true;
              } else {
                  if (this.value === 100) {
                      this.uploadStatus = 'nothing';
                      this.messageDisplayed = 'uploaded: ' + res.name;
                      this.showProgressBar = false;
                  }
              }*/

              this.showComponent = true;
              switch (res.status) {
                  case 'progress':
                      this.uploadStatus = 'uploading';
                      this.value = Number(res.message);
                      this.showProgressBar = true;
                      this.messageDisplayed.next('Uploading ' + res.name);
                      break;

                  case 'error':
                      this.showProgressBar = false;
                      this.messageDisplayed.next('Error for ' + res.name);
                      break;

                  case 'done':
                      this.showProgressBar = false;
                      this.messageDisplayed.next('Uploaded ' + res.name);
                      break;

                  default :
                      this.showProgressBar = true;
                      this.messageDisplayed.next('Uploading ' + res.name);
              }
          }
      );

      this.fileUploadService.uploadFinished$
          .subscribe(
              next => {
                  if (this.fileUploadService.uploadQueue.size === 0) {
                      const counts = this.makeUploadsStatusCounts(
                          Array.from(this.fileUploadService.filesProgress.values()).map(
                              element$ => element$.getValue()
                          )
                      );
                      this.uploadStatus = 'nothing';
                      this.messageDisplayed.next('Uploads: '
                          + counts.done
                          + ' / '
                          + counts.total
                          + ' done, '
                          + counts.error
                          + ' / '
                          + counts.total
                          + ' on error'
                      );
                  }
              }
      );

      this.messageDisplayed.subscribe(
          next => console.log('messageDisplayed => ' + next)
      );
  }

    private makeUploadsStatusCounts(uploads: Array<{ name: string, status: string, message: string }>): {
        done: number,
        error: number,
        total: number
    } {
        const res = {
            done: uploads.filter( up => up.status === 'done').length,
            error: uploads.filter( up => up.status === 'error').length,
            total: uploads.length
        };
        return res;
    }

    initProgressBar(docName: string): void {
        console.log('initProgressBar()');
        this.messageDisplayed.next('uploading: ' + docName);
        this.uploadStatus = 'uploading';
        this.value = 0;
    }
}
