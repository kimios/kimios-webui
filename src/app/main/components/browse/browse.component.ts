import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService, EXPLORER_MODE} from 'app/services/browse-entity.service';
import {of} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {ActivatedRoute} from '@angular/router';
import {catchError} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {MatDialog, PageEvent} from '@angular/material';
import {FilesUploadDialogComponent} from 'app/main/components/files-upload-dialog/files-upload-dialog.component';
import {Tag} from 'app/main/model/tag';
import {FileUploadService} from 'app/services/file-upload.service';
import {EntityMoveDialogComponent} from 'app/main/components/entity-move-dialog/entity-move-dialog.component';
import {TreeNodeMoveUpdate} from 'app/main/model/tree-node-move-update';

interface EntityNode {
  uid: number;
  label: string;
  children?: EntityNode[];
}

@Component({
  selector: 'browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

    pageSize: number;
    pageIndex: number;
    pageSizeOptions = [10, 20, 50];

    length: number;

    explorerMode: EXPLORER_MODE.BROWSE | EXPLORER_MODE.SEARCH;

    historyHasBack = false;
    historyHasForward = false;

    constructor(
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      private route: ActivatedRoute,
      private fileUploadService: FileUploadService,
      public filesUploadDialog: MatDialog,
      public entityMoveDialog: MatDialog,
      private location: Location
  ) {
    this.explorerMode = EXPLORER_MODE.BROWSE;
  }

  ngOnInit(): void {

      this.browseEntityService.historyHasForward.subscribe(
          next => this.historyHasForward = next
      );

      this.browseEntityService.historyHasBackward.subscribe(
          next => this.historyHasBack = next
      );

      this.browseEntityService.totalEntitiesToDisplay$.subscribe(
          next => this.length = next.length
      );

      this.browseEntityService.length.subscribe(
          next => this.length = next
      );

      this.pageSize = this.browseEntityService.pageSize;

      this.browseEntityService.pageIndex.subscribe(
          next => this.pageIndex = next
      );

      this.browseEntityService.explorerMode.subscribe(
          next => {
              this.explorerMode = next;
              if (this.explorerMode === EXPLORER_MODE.BROWSE) {
                  this.browseEntityService.selectedEntity$.next(this.browseEntityService.selectedEntity$.getValue());
              }
          }
      );

      this.browseEntityService.selectedEntity$.subscribe(
          entity => {
              if (entity !== undefined) {
                  const path = this.location.path();
                  console.log('current location path: ' + path);
                  const newPath = path.replace(new RegExp('(?:\/browse.*)?$'), '/browse/' + entity.uid);
                  console.log('new location path: ' + newPath);
                  this.location.replaceState(newPath);
              }
          }
      );
  }


    historyBack(): void {
        this.browseEntityService.goHistoryBack();
    }

    historyForward(): void {
        this.browseEntityService.goHistoryForward();
    }

    paginatorHandler($event: PageEvent): void {
        this.browseEntityService.makePage($event.pageIndex, $event.pageSize);
    }

    searchModeOn(): void {
        this.browseEntityService.explorerMode.next(EXPLORER_MODE.SEARCH);
    }

    searchModeOff(): void {
        this.browseEntityService.explorerMode.next(EXPLORER_MODE.BROWSE);
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

        if (event['dataTransfer'] != null
            && event['dataTransfer']['files'] != null) {
            Array.from(event['dataTransfer']['files']).forEach(file => console.log(file));
            this.openFilesUploadDialog(event['dataTransfer']['files'], event['droppedInDir'] ? event['droppedInDir'] : '');
        }
    }

    handleDragOver(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
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
                        this.fileUploadService.uploading$.next(false);
                    }
                );
        });
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
                        this.browseEntityService.updateMoveTreeNode$.next(new TreeNodeMoveUpdate(entityMoved, entityTarget, null));
                    }
                    this.browseEntityService.updateListAfterMove(entityMoved, entityTarget);
                }
            );
        });
    }

    handleFileInput(files: FileList): void {
        this.openFilesUploadDialog(files, null);
    }
}
