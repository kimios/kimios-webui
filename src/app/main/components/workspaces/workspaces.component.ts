import {AfterViewChecked, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Location, LocationStrategy} from '@angular/common';
import {BrowseEntityService, PAGE_SIZE_DEFAULT} from 'app/services/browse-entity.service';
import {MatDialog, PageEvent} from '@angular/material';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {catchError, concatMap, filter, map, takeUntil, takeWhile, tap} from 'rxjs/operators';
import {DMEntity, Folder, Workspace} from 'app/kimios-client-api';
import {FilesUploadDialogComponent} from 'app/main/components/files-upload-dialog/files-upload-dialog.component';
import {Tag} from 'app/main/model/tag';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {FileUploadService} from 'app/services/file-upload.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {TreeNodeMoveUpdate} from 'app/main/model/tree-node-move-update';
import {ErrorDialogComponent} from 'app/main/components/error-dialog/error-dialog.component';
import {AdminService} from 'app/services/admin.service';
import {ActivatedRoute} from '@angular/router';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {IconService} from 'app/services/icon.service';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {Document as KimiosDocument} from 'app/kimios-client-api/model/document';
import {CacheService} from 'app/services/cache.service';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';
import {DMEntityWrapper} from '../../../kimios-client-api/model/dMEntityWrapper';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, AfterViewChecked, OnDestroy {

  unsubscribeSubject$ = new Subject();

  @ViewChild('contentColumn') contentColumn: ElementRef;
  @ViewChild('browsePathRow') browsePathRow: ElementRef;
  @ViewChild('treeAndGridRow') treeAndGridRow: ElementRef;
  @ViewChild('sectionContainer', { read: ElementRef }) sectionContainer: ElementRef;
  @ViewChild('sectionContent') sectionContent: ElementRef;
  @ViewChild('treeAndGridRowWrapper') treeAndGridRowWrapper: ElementRef;
  @ViewChild('browsePathAndActions') browsePathAndActions: ElementRef;

  // paginator
  length: number;
  pageSize: number;
  pageSizeOptions: number[] = [10, 20, 50];
  pageIndex: number;

  isWorkspaceCreator: Observable<boolean>;

  @Input()
  entityId: number;
  initial = true;

  constructor(
      private browseEntityService: BrowseEntityService,
      private location: Location,
      private workspaceSessionService: WorkspaceSessionService,
      public filesUploadDialog: MatDialog,
      private fileUploadService: FileUploadService,
      public entityMoveDialog: MatDialog,
      private errorDialog: MatDialog,
      private adminService: AdminService,
      private route: ActivatedRoute,
      private iconService: IconService,
      private entityCacheService: EntityCacheService,
      private cacheService: CacheService
  ) {
    this.isWorkspaceCreator = this.adminService.isWorkspaceCreator();
    this.pageSize = PAGE_SIZE_DEFAULT;
  }

  ngOnInit(): void {
    this.entityId = Number(this.route.snapshot.paramMap.get('entityId'));
    if (this.entityId != null
        && this.entityId !== undefined
        && this.entityId !== 0
        && this.entityId !== NaN
    ) {
      this.browseEntityService.getEntity(this.entityId)
          .subscribe(entity => this.browseEntityService.selectedEntity$.next(entity));
      this.entityCacheService.findAllParents(this.entityId, true).pipe(
          map(parents => this.browseEntityService.currentPath.next(parents.reverse()))
      ).subscribe();
    }
    this.browseEntityService.selectedEntity$.pipe(
      takeUntil(this.unsubscribeSubject$),
      filter(entity => entity != null),
      tap(entity => {
        this.initial = false;
        const path = this.location.path();
        const newPath = path.replace(new RegExp('(?:\/workspaces.*)?$'), '/workspaces/' + entity.uid);
        this.location.replaceState(newPath);
      }),
      concatMap(entity => this.entityCacheService.findEntityChildrenInCache(entity.uid, true)),
      // tap(children => this.entityCacheService.askFoldersInFolders(children.map(folder => folder.uid)))
    ).subscribe();

    this.browseEntityService.totalEntitiesToDisplay$.pipe(
      takeUntil(this.unsubscribeSubject$)
    ).subscribe(
        next => this.length = next.length
    );

    this.workspaceSessionService.sort.pipe(
        takeUntil(this.unsubscribeSubject$),
        filter(next => next != null)
    ).subscribe(
        next => this.browseEntityService.makePage(0, this.pageSize, next)
    );

    this.browseEntityService.pageIndex.pipe(
      takeUntil(this.unsubscribeSubject$),
    ).subscribe(
        next => this.pageIndex = next
    );

    if ((this.entityId === 0 || this.entityId === NaN)
        && this.initial === true) {
      if (this.entityId === NaN) {
        this.entityId = 0;
      }
      this.initial = false;
      this.browseEntityService.retrieveWorkspaces().pipe(
          filter(workspaces => workspaces.length > 0),
          tap(workspaces => this.browseEntityService.selectedEntity$.next(workspaces[0])),
          tap(workspaces => this.browseEntityService.currentPath.next([workspaces[0]]))
      ).subscribe();
    }

    this.entityCacheService.newEntity$.pipe(
      takeUntil(this.unsubscribeSubject$),
      filter(entityWrapper => entityWrapper != null),
      tap(entityWrapper => {
        const currentPath = this.browseEntityService.currentPath.getValue();
        const currentContainerEntity = currentPath[currentPath.length - 1];
        if (this.currentContainerEntityIsEntityParent(currentContainerEntity, entityWrapper. dmEntity)) {
          this.addEntityAndReloadPage(entityWrapper);
        }
      })
    ).subscribe();

    this.cacheService.documentCreated$.pipe(
      takeUntil(this.unsubscribeSubject$),
      concatMap(document => this.entityCacheService.handleDocumentCreated(document))
    ).subscribe();

    this.browseEntityService.selectedEntityFromGridOrTree$.pipe(
      takeUntil(this.unsubscribeSubject$),
      filter(res => this.browseEntityService.browseMode$.getValue() === BROWSE_TREE_MODE.BROWSE),
      tap(next => {
        this.browseEntityService.setHistoryNewEntry(next === undefined ? undefined : next.uid);
        this.browseEntityService.goHistoryForward();
        if (next !== undefined) {
          this.browseEntityService.setCurrentPathForEntityUid(next.uid);
        }
      })
    ).subscribe();

    this.entityCacheService.folderRemoved$.pipe(
      takeUntil(this.unsubscribeSubject$),
      tap(folderId => this.browseEntityService.updateListOnDelete(folderId))
    ).subscribe();

    this.entityCacheService.folderCreated$.pipe(
      takeUntil(this.unsubscribeSubject$),
      tap(folderId => this.browseEntityService.updateListOnCreate(folderId))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribeSubject$.next();
    this.unsubscribeSubject$.complete();
  }

  ngAfterViewChecked(): void {
    // console.log(this.treeAndGridRow.nativeElement.style.height + ' = ' + this.contentColumn.nativeElement.offsetHeight + ' - ' + this.browsePathRow.nativeElement.offsetHeight);
    // this.treeAndGridRow.nativeElement.style.height = this.contentColumn.nativeElement.offsetHeight - this.browsePathRow.nativeElement.offsetHeight + 'px';
    // console.log(this.treeAndGridRow.nativeElement.style.height + ' = ' + this.contentColumn.nativeElement.offsetHeight + ' - ' + this.browsePathRow.nativeElement.offsetHeight);

    const sectionHeight = this.sectionContainer.nativeElement.offsetHeight;

    const browsePathAndActionsHeight = this.browsePathAndActions.nativeElement.offsetHeight;

    const height = (sectionHeight - browsePathAndActionsHeight) + 'px';
    this.treeAndGridRowWrapper.nativeElement.style.height = height;
    this.treeAndGridRowWrapper.nativeElement.style.maxHeight = height;
    this.treeAndGridRowWrapper.nativeElement.style.minHeight = height;
  }

  paginatorHandler($event: PageEvent): void {
    this.browseEntityService.makePage($event.pageIndex, $event.pageSize);
  }

  private addEntityAndReloadPage(entity: DMEntityWrapper): void {
    if (this.browseEntityService.addEntityToCurrentEntitiesToDisplay(entity)) {
      this.browseEntityService.reloadPage();
    }
  }

  private currentContainerEntityIsEntityParent(currentContainerEntity: DMEntity, entity: DMEntity): boolean {
    return DMEntityUtils.dmEntityIsDocument(entity) ?
      (entity as KimiosDocument).folderUid === (
        DMEntityUtils.dmEntityIsFolder(currentContainerEntity) ?
          (currentContainerEntity as Folder).uid :
          (currentContainerEntity as Workspace).uid
      ) :
      (entity as Folder).parentUid === (
        DMEntityUtils.dmEntityIsFolder(currentContainerEntity) ?
          (currentContainerEntity as Folder).uid :
          (currentContainerEntity as Workspace).uid
      );
  }

  openFilesUploadDialog(filesMap: Map<string, Array<File>>, droppedInDir?: DMEntity, droppedInTree?: boolean, dirsToCreate?: Array<string>): void {
    // filesMap = this.clearEmptyValues(filesMap);
    const dialogRef = this.filesUploadDialog.open(FilesUploadDialogComponent, {
      // width: '250px',
      data: {
        filesList: filesMap,
        filesTags: new Map<string, Map<number, Tag>>()
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (! result) {
        return;
      }

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
      let filesToUpload = new Array<FileToUpload>();
      dialogRef.componentInstance.data.filesList.forEach((filesArray, filesPath) =>
          filesToUpload = filesToUpload.concat(filesArray.map(file => new FileToUpload(file, filesPath)))
      );
      this.fileUploadService.uploadFiles(filesToUpload.map(v => [
        v.file,
        path + '/' + v.relativePath + v.file.name,
        true,
        '[]',
        true,
        -1,
        '[]',
        dialogRef.componentInstance.data.filesTags.get(v.file.name) ?
            dialogRef.componentInstance.data.filesTags.get(v.file.name) :
            [],

      ]))
          .pipe(
              catchError(error => {
                return of({ name: 'filename', status: 'error', message: (error.error && error.error.message) ? error.error.message : '' });
              })
          )
          .subscribe(
              null,
              null,
              () => {
                // this.browseEntityService.deleteCacheEntry(parentDir.uid);
                this.browseEntityService.selectedEntity$.next(currentDir);
                this.fileUploadService.uploading$.next(false);
                // this.browseEntityService.onAddedChildToEntity$.next(parentDir.uid);
              }
          );
    });
  }

  handleFileInput(files: FileList): void {
    const filesMap = this.computeFilePathMap(files);
    this.openFilesUploadDialog(filesMap, null);
  }

  computeFilePathMap(files: FileList):  Map<string, File[]> {
    const filesMap = new Map<string, Array<File>>();

    for (let i = 0; i < files.length; i++) {
      const fileItem = files.item(i);
      const relativePath = fileItem['webkitRelativePath'];
      if (relativePath === '') {
        if (filesMap.get('') == null) {
          filesMap.set('', new Array<File>());
        }
        filesMap.get('').push(fileItem);
      } else {
        const splitTab = relativePath.toString().split('/');
        if (splitTab.length > 1) {
          splitTab.splice(splitTab.length - 1, 1);
          const fileRelativePath = splitTab.join('/') + '/';
          if (filesMap.get(fileRelativePath) == null) {
            filesMap.set(fileRelativePath, new Array<File>());
          }
          filesMap.get(fileRelativePath).push(fileItem);
        }
      }
    }

    return filesMap;
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
      const entityMoved = this.entityCacheService.getEntity(Number(dataSplitted[1]));
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
        const files = new Map<string, Array<File>>();
        const dirsToCreate = new Array<string>();
        // let currentPathStr = '';
        // this.browseEntityService.currentPath.getValue().forEach(dmEntity => currentPathStr += dmEntity.name + '/');
        files.set('', new Array<File>());
        const loading = new BehaviorSubject<boolean>(null);
        let nbLoading = 0;
        let nbItemsToScan = items.length;
        loading.pipe(
            filter(value => value != null),
            map(value => nbLoading = nbLoading + (value === true ? 1 : -1)),
            takeWhile(() => nbLoading !== 0 && nbItemsToScan > 0),
        ).subscribe(
            null,
            null,
            () => this.openFilesUploadDialog(
                files,
                event['droppedInDir'] ? event['droppedInDir'] : '',
                event['droppedInTreeNode'] ? event['droppedInTreeNode'] : null,
                dirsToCreate
            )
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
          this.scanFiles(entry, '', loading, files, '', dirsToCreate);
          i++;
          nbItemsToScan--;
        }
      } else {
        if (event['dataTransfer']['files'] != null
            && event['dataTransfer']['files'].length > 0) {
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

  private scanFiles(item, container, loading: BehaviorSubject<boolean>, files: Map<string, Array<File>>, path: string, dirsToCreate: Array<string>): void {
    loading.next(true);
    if (item.isDirectory) {
      const dirPath = path + item.name + '/';
      dirsToCreate.push(dirPath);
      files.set(dirPath, new Array<File>());
      const directoryReader = item.createReader();
      directoryReader.readEntries(entries => {
        entries.forEach(entry => {
          this.scanFiles(entry, item.name, loading, files, dirPath, dirsToCreate);
        });
        loading.next(false);
      });
    } else {
      const promise = new Promise(resolve => {
        item.file(file => {
          files.get(path).push(file);
          loading.next(false);
        });
      });
    }
  }

  private openEntityMoveConfirmDialog(entityMoved: DMEntity, entityTarget: DMEntity): void {
    const dialogRef = this.entityMoveDialog.open(ConfirmDialogComponent, {
      // width: '250px',
      data: {
        dialogTitle: 'Confirm move?',
        iconLine1: DMEntityUtils.dmEntityIsDocument(entityMoved) ?
          DMEntityUtils.retrieveEntityIconName(this.iconService, entityMoved, 'far') :
        null,
        messageLine1: entityMoved.name,
        messageLine2: 'to ' + entityTarget.path
            /* this.browseEntityService.computeEntityPath(
            DMEntityUtils.dmEntityIsDocument(entityMoved) ?
                (<KimiosDocument>entityMoved).folderUid :
                (<Folder>entityMoved).parentUid)*/
      }
    });

    dialogRef.afterClosed().subscribe(next => {
      if (next !== true) {
        return;
      }
      const movedEntityInitialUid = entityMoved.uid;
      const movedEntityInitialParentUid = DMEntityUtils.dmEntityIsDocument(entityMoved) ?
        (entityMoved as KimiosDocument).folderUid :
        (entityMoved as Folder).parentUid;
      this.browseEntityService.moveEntity(entityMoved, entityTarget).pipe(
          concatMap(() => this.entityCacheService.reloadEntity(entityMoved.uid)),
        tap(reloadedEntity => {
          if (DMEntityUtils.dmEntityIsFolder(reloadedEntity)) {
            this.browseEntityService.updateMoveTreeNode$.next(new TreeNodeMoveUpdate(reloadedEntity, entityTarget, movedEntityInitialUid));
          }
        }),
        concatMap(reloadedEntity => this.browseEntityService.updateListAfterMove(reloadedEntity, entityTarget, movedEntityInitialParentUid))
      ).subscribe(
          null,
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

  private clearEmptyValues(files: Map<string, Array<File>>): Map<string, Array<File>> {
    Array.from(files.keys())
        .filter(key => files.get(key).length === 0)
        .forEach(keyWithEmptyValue => files.delete(keyWithEmptyValue));
    return files;
  }
}

export class FileToUpload {
  private _relativePath: string;
  private _file: File;

  constructor(file: File, relativePath: string) {
    this._file = file;
    this._relativePath = relativePath;
  }

  get relativePath(): string {
    return this._relativePath;
  }

  get file(): File {
    return this._file;
  }
}
