import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {MatDialog, PageEvent} from '@angular/material';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {catchError, concatMap, filter, map, takeWhile, tap} from 'rxjs/operators';
import {DMEntity, Document as KimiosDocument, Folder} from 'app/kimios-client-api';
import {FilesUploadDialogComponent} from 'app/main/components/files-upload-dialog/files-upload-dialog.component';
import {Tag} from 'app/main/model/tag';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {FileUploadService} from 'app/services/file-upload.service';
import {EntityMoveDialogComponent} from 'app/main/components/entity-move-dialog/entity-move-dialog.component';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {TreeNodeMoveUpdate} from 'app/main/model/tree-node-move-update';
import {ErrorDialogComponent} from 'app/main/components/error-dialog/error-dialog.component';
import {AdminService} from 'app/services/admin.service';

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

  isWorkspaceCreator: Observable<boolean>;

  constructor(
      private browseEntityService: BrowseEntityService,
      private location: Location,
      private workspaceSessionService: WorkspaceSessionService,
      public filesUploadDialog: MatDialog,
      private fileUploadService: FileUploadService,
      public entityMoveDialog: MatDialog,
      private errorDialog: MatDialog,
      private adminService: AdminService
  ) {
    console.log('in workspace constructor');

    this.isWorkspaceCreator = this.adminService.isWorkspaceCreator();
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
    // this.treeAndGridRow.nativeElement.style.height = this.contentColumn.nativeElement.offsetHeight - this.browsePathRow.nativeElement.offsetHeight + 'px';
    console.log(this.treeAndGridRow.nativeElement.style.height + ' = ' + this.contentColumn.nativeElement.offsetHeight + ' - ' + this.browsePathRow.nativeElement.offsetHeight);
   }

  paginatorHandler($event: PageEvent): void {
    this.browseEntityService.makePage($event.pageIndex, $event.pageSize);
  }

  openFilesUploadDialog(list: Array<File>, droppedInDir?: DMEntity, droppedInTree?: boolean): void {
    const dialogRef = this.filesUploadDialog.open(FilesUploadDialogComponent, {
      // width: '250px',
      data: {
        filesList: list,
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
        if (droppedInTree !== null && droppedInTree === true) {
          path = this.browseEntityService.computeEntityPath(droppedInDir.uid);
        } else {
          path += '/' + droppedInDir.name;
        }
        parentDir = droppedInDir;
      } else {
        parentDir = currentDir;
      }

      this.fileUploadService.uploading$.next(true);
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
                this.fileUploadService.uploading$.next(false);
              }
          );
    });
  }

  handleFileInput(files: FileList): void {
    const array = new Array<File>();
    for (let i = 0; i < files.length; i++) {
      array.push(files.item(i));
    }

    this.openFilesUploadDialog(array, null);
  }

  handleDrop(event: Event): boolean {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

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
        return false;
      }
      console.log(dataSplitted.join(' : '));
      const entityMoved = this.browseEntityService.entities.get(Number(dataSplitted[1]));
      const entityTarget = event['droppedInDir'];
      if (DMEntityUtils.dmEntityIsDocument(entityMoved)
        || this.browseEntityService.checkMoveIsPossible(entityMoved, entityTarget)) {
        this.openEntityMoveConfirmDialog(
            entityMoved,
            entityTarget
        );
      } else {
        this.openErrorDialog('This move is not allowed');
      }
      return false;
    }

    console.dir(event['dataTransfer']);

    if (event['dataTransfer'] != null) {

      if (event['dataTransfer']['items'] != null
          && event['dataTransfer']['items'].length > 0) {

        const items = event['dataTransfer']['items'];

        /*
const loading = new BehaviorSubject(null);
let nbLoading = 0;
loading.pipe(
    filter(value => value != null),
    map(value => nbLoading = nbLoading + (value === true ? 1 : -1)),
    tap(value => console.log('nbLoading: ' + nbLoading)),
    takeWhile(() => nbLoading !== 0),
).subscribe();
*/
        const files = new Array<File>();
        const loading = new BehaviorSubject<boolean>(null);
        let nbLoading = 0;
        let nbItemsToScan = items.length;
        loading.pipe(
            filter(value => value != null),
            map(value => nbLoading = nbLoading + (value === true ? 1 : -1)),
            tap(value => console.log('nbLoading: ' + nbLoading)),
            takeWhile(() => nbLoading !== 0 && nbItemsToScan > 0),
        ).subscribe(
            null,
            null,
            () => this.openFilesUploadDialog(files)
        );

        let i = 0;
        while (i < items.length) {
          const item = items[i];
          const entry = item.webkitGetAsEntry();
          /*if (item.kind === 'file') {
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
          }*/
          this.scanFiles(entry, '', loading, files);
          i++;
          nbItemsToScan--;
        }
      } else {
        if (event['dataTransfer']['files'] != null
            && event['dataTransfer']['files'].length > 0) {
          Array.from(event['dataTransfer']['files']).forEach(file => console.log(file));
          this.openFilesUploadDialog(
              event['dataTransfer']['files'],
              event['droppedInDir'] ? event['droppedInDir'] : '',
              event['droppedInTreeNode'] ? event['droppedInTreeNode'] : null
          );
        }
      }
    }
    return false;
  }

  private scanFiles(item, container, loading: BehaviorSubject<boolean>, files: Array<File>): void {
    loading.next(true);
    if (item.isDirectory) {
      const directoryReader = item.createReader();
      directoryReader.readEntries(entries => {
        entries.forEach(entry => {
          this.scanFiles(entry, item.name, loading, files);
        });
        loading.next(false);
      });
    } else {
      const promise = new Promise(resolve => {
        item.file(file => {
          files.push(file);
          loading.next(false);
        });
      });
    }
  }

  private openEntityMoveConfirmDialog(entityMoved: DMEntity, entityTarget: DMEntity): void {
    const dialogRef = this.entityMoveDialog.open(EntityMoveDialogComponent, {
      // width: '250px',
      data: {
        entityMoved: entityMoved,
        entityTarget: entityTarget,
        fromPath: this.browseEntityService.computeEntityPath(
            DMEntityUtils.dmEntityIsDocument(entityMoved) ?
                (<KimiosDocument>entityMoved).folderUid :
                (<Folder>entityMoved).parentUid
        )
      }
    });

    dialogRef.afterClosed().subscribe(next => {
      if (next !== true) {
        return;
      }
      const movedEntityInitialParentUid = entityMoved.uid;
      this.browseEntityService.moveEntity(entityMoved, entityTarget).pipe(
          concatMap(() => this.browseEntityService.reloadEntity(entityMoved.uid))
      ).subscribe(
          reloadedEntity => {
            if (DMEntityUtils.dmEntityIsFolder(reloadedEntity)) {
              this.browseEntityService.updateMoveTreeNode$.next(new TreeNodeMoveUpdate(reloadedEntity, entityTarget, movedEntityInitialParentUid));
            }
            this.browseEntityService.updateListAfterMove(reloadedEntity, entityTarget);
            console.log(
                'moved entity '
                + reloadedEntity.name
                + ' to '
                + entityTarget.name
            );
          },
          // TODO : enhance dialog and message
          error => alert(error.error && error.error.message ? error.error.message : 'an error occured, the move has not been done'),
      );
    });
  }

  private openErrorDialog(msg: string): void {
    const dialogRef = this.errorDialog.open(ErrorDialogComponent, {
      data: {
        message: msg
      }
    });
  }
}
