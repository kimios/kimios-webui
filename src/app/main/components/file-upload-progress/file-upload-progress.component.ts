import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {FileUploadService} from 'app/services/file-upload.service';
import {concatMap, map} from 'rxjs/operators';
import {el} from '@angular/platform-browser/testing/src/browser_util';

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
        concatMap(
            res => res ? this.fileUploadService.filesProgress.get(res) : of()
        )
    ).subscribe(
        res => {
          this.progress = of(res);
          console.log('in FileUploadProgressComponent');
          console.log(res);
        }
    );

  }
}
