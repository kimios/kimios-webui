import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {DEFAULT_DISPLAYED_COLUMNS, EntityDataSource} from 'app/main/file-manager/entity-data-source';
import {ColumnDescription} from 'app/main/model/column-description';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {Router} from '@angular/router';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {MatDialog, Sort} from '@angular/material';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {filter} from 'rxjs/operators';
import {FilePermissionsDialogComponent} from 'app/main/components/file-permissions-dialog/file-permissions-dialog.component';
import {ShareDialogComponent} from 'app/main/components/share-dialog/share-dialog.component';

const sortMapping = {
  'name': 'name',
  'versionUpdateDate': 'updateDate',
  'extension': 'extension'
};

@Component({
  selector: 'browse-list',
  templateUrl: './browse-list.component.html',
  styleUrls: ['./browse-list.component.scss']
})
export class BrowseListComponent implements OnInit, OnDestroy {

  dataSource: EntityDataSource;
  displayedColumns = [];
  columnsDescription: ColumnDescription[] = DEFAULT_DISPLAYED_COLUMNS;
  // Private
  private _unsubscribeAll: Subject<any>;
  selected: DMEntity;
  sort: DMEntitySort = { name: 'name', direction: 'asc' };

  dragOverDir: number;

  constructor(
      private bes: BrowseEntityService,
      private router: Router,
      private documentDetailService: DocumentDetailService,
      private workspaceSessionService: WorkspaceSessionService,
      public dialog: MatDialog,
      public entityMoveDialog: MatDialog,
  ) {
    this.columnsDescription.forEach((elem) => {
      this.displayedColumns.push(elem.matHeaderCellDef);
    });
    this.displayedColumns.push('actions');
    // Set the private defaults
    this._unsubscribeAll = new Subject();
    this.dragOverDir = 0;
  }

  ngOnInit(): void {
    this.dataSource = new EntityDataSource();
    this.workspaceSessionService.sort.pipe(
        filter(next => next !== undefined && next != null)
    ).subscribe(
        next => this.sort = next
    );
    this.workspaceSessionService.closePermissionsDialog.pipe(
        filter(next => next != null)
    ).subscribe(
        next => this.dialog.closeAll()
    );
    this.bes.entitiesToDisplay$.subscribe(
        entities => this.dataSource.setData(entities)
    );
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void
  {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onSelect(row: DMEntity): void {
    this.selected = row;
  }

  goToDocument(entityFromList: any): void {
    if (DMEntityUtils.dmEntityIsFolder(entityFromList) || DMEntityUtils.dmEntityIsWorkspace(entityFromList)) {
      this.bes.goInContainerEntity(entityFromList);
    } else {
      DocumentUtils.navigateToFile(this.router, entityFromList.uid);
    }
  }

  handleFileDownload(versionId: number): void {
    this.documentDetailService.downloadDocumentVersion(versionId);
  }

  sortData($event: Sort): void {
    if (sortMapping[$event.active] !== undefined && sortMapping != null) {
      const direction = ($event.direction !== 'asc' && $event.direction !== 'desc') ?
        'asc' :
        $event.direction;

      this.workspaceSessionService.sort.next({name: sortMapping[$event.active], direction: direction});
    }
  }

    openPermissionsDialog(entityId: number): void {
      const dialogRef = this.dialog.open(FilePermissionsDialogComponent, {
        data: {
          'uid': entityId
        },
        panelClass: 'kimios-dialog',
        width: '400px',
        height: '400px'
      });
    }

  openShareDialog(docId: number, docName: string): void {
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      data: {
        'uid': docId,
        'name': docName
      },
      panelClass: 'kimios-dialog'
    });

    this.bes.shareDocumentReturn$.subscribe(
        res => {
          if (res) {
            dialogRef.close();
          }
        }
    );
  }

  handleDrop($event: DragEvent, row: DMEntity): void {
    this.resetDragOverDir();
    $event.preventDefault();
    if (! DMEntityUtils.dmEntityIsFolder(row)) {
        if ($event['kimiosEntityMove'] === true) {
          console.log('moving in doc, just impossible…');
          $event.stopPropagation();
        }
        // it's a document import on current directory
    } else {
      if (DMEntityUtils.dmEntityIsFolder(row)) {
        $event['droppedInDir'] = row;
      }
    }
  }

  handleDragOver($event: DragEvent, row: DMEntity): void {
    if (DMEntityUtils.dmEntityIsFolder(row)) {
      this.dragOverDir = row.uid;
    }
    $event.preventDefault();
    $event.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter($event: DragEvent): void {
  }

  dragStart($event: DragEvent, row: DMEntity): void {
    console.log('dragging ' + row.name);
    $event.dataTransfer.setData('text', row.uid.toString());
    $event.dataTransfer.effectAllowed = 'move';
    $event['kimiosEntityMove'] = true;
    $event.dataTransfer.setData('text/plain', 'kimiosEntityMove:' + row.uid);
  }

  isDragOver(uid: number): boolean {
    return uid === this.dragOverDir;
  }

  handleDragEnd($event: DragEvent, row: DMEntity): void {
    if (this.dragOverDir === row.uid) {
      this.resetDragOverDir();
    }
  }

  handleDragExit($event: Event, row: DMEntity): void {
    if (this.dragOverDir === row.uid) {
      this.resetDragOverDir();
    }
  }

  resetDragOverDir(): void {
    this.dragOverDir = 0;
  }
}
