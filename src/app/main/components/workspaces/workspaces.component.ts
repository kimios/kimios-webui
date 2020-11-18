import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {MatDialog, PageEvent} from '@angular/material';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {catchError, filter} from 'rxjs/operators';
import {DMEntity} from 'app/kimios-client-api';
import {FilesUploadDialogComponent} from 'app/main/components/files-upload-dialog/files-upload-dialog.component';
import {Tag} from 'app/main/model/tag';
import {of} from 'rxjs';
import {FileUploadService} from 'app/services/file-upload.service';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, AfterViewInit {

  @ViewChild('contentColumn') contentColumn: ElementRef;
  @ViewChild('browsePathRow') browsePathRow: ElementRef;
  @ViewChild('treeAndGridRow') treeAndGridRow: ElementRef;

  // paginator
  length: number;
  pageSize: number;
  pageSizeOptions: number[] = [10, 20, 50];
  pageIndex: number;

  constructor(
      private browseEntityService: BrowseEntityService,
      private location: Location,
      private workspaceSessionService: WorkspaceSessionService,
      public filesUploadDialog: MatDialog,
      private fileUploadService: FileUploadService
  ) {
    console.log('in workspace constructor');
  }

  ngOnInit(): void {
    this.browseEntityService.selectedEntity$.subscribe(
        entity => {
          if (entity !== undefined) {
            const path = this.location.path();
            console.log('current location path: ' + path);
            const newPath = path.replace(new RegExp('(?:\/workspaces.*)?$'), '/workspaces/' + entity.uid);
            console.log('new location path: ' + newPath);
            this.location.replaceState(newPath);
          }
        }
    );

    this.browseEntityService.totalEntitiesToDisplay$.subscribe(
        next => this.length = next.length
    );

    this.workspaceSessionService.sort.pipe(
        filter(next => next != null)
    ).subscribe(
        next => this.browseEntityService.makePage(0, this.pageSize, next)
    );

    this.browseEntityService.pageIndex.subscribe(
        next => this.pageIndex = next
    );
  }

  ngAfterViewInit(): void {
    console.log(this.treeAndGridRow.nativeElement.style.height + ' = ' + this.contentColumn.nativeElement.offsetHeight + ' - ' + this.browsePathRow.nativeElement.offsetHeight);
    this.treeAndGridRow.nativeElement.style.height = this.contentColumn.nativeElement.offsetHeight - this.browsePathRow.nativeElement.offsetHeight + 'px';
    console.log(this.treeAndGridRow.nativeElement.style.height + ' = ' + this.contentColumn.nativeElement.offsetHeight + ' - ' + this.browsePathRow.nativeElement.offsetHeight);
   }

  paginatorHandler($event: PageEvent): void {
    this.browseEntityService.makePage($event.pageIndex, $event.pageSize);
  }

  openFilesUploadDialog(list: FileList, droppedInDir?: DMEntity): void {
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

      const currentPath = this.browseEntityService.currentPath.getValue();
      let path: string;
      let currentDir: DMEntity;
      if (currentPath.length > 0) {
        currentDir = currentPath[currentPath.length - 1];
        path = currentDir.path;
      } else {
        return;
      }

      let parentDir: DMEntity;
      if (droppedInDir !== null && droppedInDir !== undefined && droppedInDir !== '') {
        path += '/' + droppedInDir.name;
        parentDir = droppedInDir;
      } else {
        parentDir = currentDir;
      }

      this.fileUploadService.uploadFiles(dialogRef.componentInstance.data.filesList.map(v => [
        v,
        path + '/' + v.name,
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
                return of({ name: 'filename', status: 'error', message: (error.error && error.error.message) ? error.error.message : '' });
              })
          )
          .subscribe(
              null,
              null,
              () => {
                this.browseEntityService.deleteCacheEntry(parentDir.uid);
                this.browseEntityService.selectedEntity$.next(currentDir);
              }
          );
    });
  }

  handleFileInput(files: FileList): void {
    this.openFilesUploadDialog(files, null);
  }
}
