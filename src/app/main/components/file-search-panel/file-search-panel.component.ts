import { Component, OnInit } from '@angular/core';
import {isNumber} from 'util';
import {FileUploadService} from 'app/services/file-upload.service';
import {PAGE_SIZE_DEFAULT, SearchEntityService} from 'app/services/searchentity.service';
import {MatDialog, PageEvent} from '@angular/material';
import {BehaviorSubject, of} from 'rxjs';
import {FilesUploadDialogComponent} from 'app/main/components/files-upload-dialog/files-upload-dialog.component';
import {Tag} from 'app/main/model/tag';
import {catchError} from 'rxjs/operators';
import {DEFAULT_PATH} from 'app/main/file-manager/file-manager.component';

@Component({
  selector: 'file-search-panel',
  templateUrl: './file-search-panel.component.html',
  styleUrls: ['./file-search-panel.component.scss']
})
export class FileSearchPanelComponent implements OnInit {
  private filesPath: string = DEFAULT_PATH;

  totalFilesFound$: BehaviorSubject<number>;
  fileToUpload: File = null;

  pageSize: number;
  pageIndex: number;
  pageSizeOptions = [5, 10, 20];

  constructor(
      private fileUploadService: FileUploadService,
      private searchEntityService: SearchEntityService,
      public filesUploadDialog: MatDialog
  ) {
    this.totalFilesFound$ = new BehaviorSubject<number>(undefined);
    this.pageSize = PAGE_SIZE_DEFAULT;
  }

  static compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  ngOnInit(): void {
    this.searchEntityService.onTotalFilesChanged.subscribe(
        res => this.totalFilesFound$.next(isNumber(res) ? res : undefined)
    );
    this.searchEntityService.onSortChanged.subscribe(
        res => this.pageIndex = 0
    );
  }


  onSubmitFileUpload(): void {
    const formData = new FormData();
    formData.append('file', this.fileToUpload);
  }

  handleFileInput(files: FileList): void {
    this.fileToUpload = files.item(0);

    /*this.fileUploadService.uploading$.next(true);
    this.fileUploadService.uploadFile(
        null,
        this.fileToUpload,
        this.filesPath + '/' + this.fileToUpload.name,
        true,
        '[]',
        true,
        -1,
        '[]'
    ).subscribe(
        null,
        null,
        () => {
          this.searchEntityService.reloadFiles().subscribe();
          this.fileUploadService.uploading$.next(false);
        }

    );*/
  }

  handleDrop(event: Event): void {
    event.preventDefault();

    if (event['dataTransfer'] != null
        && event['dataTransfer']['files'] != null) {
      Array.from(event['dataTransfer']['files']).forEach(file => console.log(file));
      this.openFilesUploadDialog(event['dataTransfer']['files']);
    }
  }

  handleDragOver(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  openFilesUploadDialog(list: FileList): void {
    const dialogRef = this.filesUploadDialog.open(FilesUploadDialogComponent, {
      // width: '250px',
      data: {
        filesList: Array.from(list),
        filesTags: new Map<string, Map<number, Tag>>()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (! result) {
        return;
      }
      console.log('The dialog was closed');
      console.dir(dialogRef.componentInstance.data.filesList);

      this.fileUploadService.uploadFiles(dialogRef.componentInstance.data.filesList.map(v => [
        v,
        this.filesPath + '/' + v.name,
        true,
        '[]',
        true,
        -1,
        '[]',
        dialogRef.componentInstance.data.filesTags.get(v.name) ?
            Array.from(dialogRef.componentInstance.data.filesTags.get(v.name).keys()) :
            []
      ]))
          .pipe(
              catchError(error => {
                console.log('server error: ');
                console.dir(error);
                return of({ name: 'filename', status: 'error', message: (error.error && error.error.message) ? error.error.message : '' });
              })
          )
          .subscribe(
              null,
              null,
              () => this.searchEntityService.reloadFiles().subscribe()
          );
    });
  }

  paginatorHandler($event: PageEvent): void {
    this.searchEntityService.changePage($event.pageIndex, $event.pageSize).subscribe(
        null,
        null,
        () => {
          this.pageIndex = $event.pageIndex;
          this.pageSize = $event.pageSize;
        }
    );
  }
}
