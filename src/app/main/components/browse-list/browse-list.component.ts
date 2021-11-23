import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
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
import {concatMap, filter, tap} from 'rxjs/operators';
import {FilePermissionsDialogComponent} from 'app/main/components/file-permissions-dialog/file-permissions-dialog.component';
import {ShareDialogComponent} from 'app/main/components/share-dialog/share-dialog.component';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {IconService} from 'app/services/icon.service';
import {DocumentExportService} from 'app/services/document-export.service';
import {EntityCacheService} from 'app/services/entity-cache.service';

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
  deleteDocument$: BehaviorSubject<number>;
  showSpinner = false;

  constructor(
      private bes: BrowseEntityService,
      private router: Router,
      private documentDetailService: DocumentDetailService,
      private workspaceSessionService: WorkspaceSessionService,
      public dialog: MatDialog,
      public entityMoveDialog: MatDialog,
      private iconService: IconService,
      private documentExportService: DocumentExportService,
      private entityCacheService: EntityCacheService
  ) {
    this.columnsDescription.forEach((elem) => {
      this.displayedColumns.push(elem.matHeaderCellDef);
    });
    this.displayedColumns.push('actions');
    // Set the private defaults
    this._unsubscribeAll = new Subject();
    this.dragOverDir = 0;
    this.deleteDocument$ = new BehaviorSubject<number>(null);
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

    this.bes.removedFolder$.pipe(
        /*filter(res => res != null),
        concatMap(uid => combineLatest(of(uid), this.bes.deleteDocument(uid))),
        concatMap(([uid, res]) => this.entityCacheService.findDocumentInCache(uid)),
        tap(doc => this.bes.deleteCacheEntry(doc.folderUid)),
        concatMap(doc => this.bes.getEntity(doc.folderUid)),*/
        tap(parentFolder => {
          // const currentPath = this.bes.currentPath.getValue();
          // const currentDir = currentPath[currentPath.length - 1];
          // this.bes.selectedEntity$.next(currentDir);
          this.bes.loading$.next(false);
        })
    ).subscribe();

    this.bes.loading$.subscribe(
        res => this.showSpinner = res
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

  goToDocument(entityFromList: any, section?: string): void {
    if (DMEntityUtils.dmEntityIsFolder(entityFromList) || DMEntityUtils.dmEntityIsWorkspace(entityFromList)) {
      this.bes.goInContainerEntity(entityFromList);
    } else {
      if (section != null && section !== '') {
        DocumentUtils.navigateToFile(this.router, entityFromList.uid, section);
      } else {
        DocumentUtils.navigateToFile(this.router, entityFromList.uid);
      }
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
        if ($event.dataTransfer
            && $event.dataTransfer.getData('text/plain').includes('kimiosEntityMove:')) {
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
    if (row != null
        && row !== undefined
        && DMEntityUtils.dmEntityIsFolder(row)) {
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
    if (row != null
        && row !== undefined
        && this.dragOverDir === row.uid) {
      this.resetDragOverDir();
    }
  }

  handleDragExit($event: Event, row: DMEntity): void {
    if (row != null
      && row !== undefined
      && this.dragOverDir === row.uid) {
      this.resetDragOverDir();
    }
  }

  resetDragOverDir(): void {
    this.dragOverDir = 0;
  }

  handleBookmarkDocument(entity: DMEntity): void {
    if (entity.bookmarked === true) {
      this.documentDetailService.removeBookmark(entity.uid);
    } else {
      this.documentDetailService.addBookmark(entity.uid);
    }

    of(entity.bookmarked === true).pipe(
        concatMap(res => {
          if (res) {
            return this.documentDetailService.removeBookmark(entity.uid);
          } else {
            return this.documentDetailService.addBookmark(entity.uid);
          }
        })
    ).subscribe(
        next => entity.bookmarked = !entity.bookmarked
    );
  }

  entityStarIcon(entity: DMEntity): string {
    return (entity.bookmarked != null
        && entity.bookmarked === true) ?
        'star' :
        'star_border';
  }

  delete(uid: number, name: string): void {
    const entityToDelete = this.bes.entitiesToDisplay$.getValue().filter(element => element.uid === uid)[0];

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle: this.makeDialogTitle(entityToDelete),
        iconLine1: DMEntityUtils.dmEntityIsDocument(entityToDelete) ?
          DMEntityUtils.retrieveEntityIconName(this.iconService, entityToDelete, 'far') :
          null,
        messageLine1: entityToDelete.name,
      }/*,
      width: '400px',
      height: '400px'*/
    });

    dialogRef.afterClosed().pipe(
      filter(result => result === true),
      concatMap(() => this.deleteEntity(entityToDelete)),
      tap(() => this.bes.loading$.next(false))
    ).subscribe();
  }

  retrieveDocumentIcon(element: DMEntity, iconPrefix: string): string {
    return DMEntityUtils.retrieveEntityIconName(this.iconService, element, iconPrefix);
  }

  addToShoppingCart(entity: DMEntity): void {
    this.documentExportService.addToCart(entity);
  }

  deleteEntity(entity: DMEntity): Observable<boolean> {
    return this.bes.deleteEntity(entity);
  }

  private makeDialogTitle(entityToDelete: DMEntity): string {
    return 'Delete '
      + (DMEntityUtils.dmEntityIsDocument(entityToDelete) ?
        'document' :
        'folder')
      + '?';
  }
}
