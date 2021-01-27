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
import {EntityMoveDialogComponent} from 'app/main/components/entity-move-dialog/entity-move-dialog.component';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {TreeNodeMoveUpdate} from 'app/main/model/tree-node-move-update';

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
      private fileUploadService: FileUploadService,
      public entityMoveDialog: MatDialog,
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

  handleDrop(event: Event): void {
    event.preventDefault();

    if (event['dataTransfer']
        && event['dataTransfer'].getData('text/plain') !== null
        && event['dataTransfer'].getData('text/plain') !== undefined
        && event['dataTransfer'].getData('text/plain').startsWith('kimiosEntityMove')
        && event['droppedInDir'] !== null
        && event['droppedInDir'] !== undefined) {

      const data = event['dataTransfer'].getData('text/plain');
      const dataSplitted = data.split(':');
      if (dataSplitted.length !== 2
          || Number(dataSplitted[1]) === NaN) {
        return;
      }
      console.log(dataSplitted.join(' : '));
      this.openEntityMoveConfirmDialog(
          this.browseEntityService.entities.get(Number(dataSplitted[1])),
          event['droppedInDir']
      );
      return;
    }

    console.dir(event['dataTransfer']);

    if (event['dataTransfer'] != null
        && event['dataTransfer']['files'] != null) {
      Array.from(event['dataTransfer']['files']).forEach(file => console.log(file));

      /*const items = event['dataTransfer'].items;
      const loading = new BehaviorSubject(null);
      let nbLoading = 0;
      loading.pipe(
          filter(value => value != null),
          map(value => nbLoading = nbLoading + (value === true ? 1 : -1)),
          tap(value => console.log('nbLoading: ' + nbLoading)),
          takeWhile(() => nbLoading !== 0),
      ).subscribe();*/

      /*const item = items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry.isFile) {

        } else if (entry.isDirectory) {
          const directoryReader = entry.createReader();
          new Promise((resolve, reject) => {
            directoryReader.readEntries(
                entries => {
                  resolve(entries);
                },
                err => {
                  reject(err);
                }
            );
          }).then(
              entries => console.dir(entries)
          );
        }
      }
      }*/
      /*loading.pipe(
          tap(val => console.log('loading ' + val)),
          filter(val => val === false),
          delay(500),
          filter(val => nbLoading === 0)
      ).subscribe(
          open =>*/
      this.openFilesUploadDialog(
          event['dataTransfer']['files'],
          event['droppedInDir'] ? event['droppedInDir'] : '',
//          event['dataTransfer'].items
      );
      /*);

      for (let i = 0; i < items.length; i++) {
        loading.next(true);
        const entry = items[i].webkitGetAsEntry(); // only for Webkit
        // though apparently
        // FF has it too
        if (entry) {
          recurseItem(entry, '/', loading);
        }
        loading.next(false);
      }*/
    }
  }

  private openEntityMoveConfirmDialog(entityMoved: DMEntity, entityTarget: DMEntity): void {
    const dialogRef = this.entityMoveDialog.open(EntityMoveDialogComponent, {
      // width: '250px',
      data: {
        entityMoved: entityMoved,
        entityTarget: entityTarget,
        fromPath: this.browseEntityService.currentPath.getValue().reverse()[0].path
      }
    });

    dialogRef.afterClosed().subscribe(next => {
      if (next !== true) {
        return;
      }
      this.browseEntityService.moveEntity(entityMoved, entityTarget).subscribe(
          null,
          // TODO : enhance dialog and message
          error => alert(error.error && error.error.message ? error.error.message : 'an error occured, the move has not been done'),
          () => {
            console.log(
                'moved entity '
                + entityMoved.name
                + ' to '
                + entityTarget.name
            );
            if (DMEntityUtils.dmEntityIsFolder(entityMoved)) {
              this.browseEntityService.updateMoveTreeNode$.next(new TreeNodeMoveUpdate(entityMoved, entityTarget));
            }
            this.browseEntityService.updateListAfterMove(entityMoved, entityTarget);
          }
      );
    });
  }
}
