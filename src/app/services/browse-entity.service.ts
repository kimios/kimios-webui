import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {DMEntity, DocumentService, Folder, FolderService, Workspace, WorkspaceService} from 'app/kimios-client-api';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {catchError, concatMap, filter, map, switchMap, takeWhile, tap} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {SearchEntityService} from 'app/services/searchentity.service';
import {TreeNodeMoveUpdate} from 'app/main/model/tree-node-move-update';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {Router} from '@angular/router';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';
import {EntityCacheService} from './entity-cache.service';
import {DMEntityWrapper} from '../kimios-client-api/model/dMEntityWrapper';

export const PAGE_SIZE_DEFAULT = 20;

export enum EXPLORER_MODE {
    BROWSE = 0,
    SEARCH = 1
}

@Injectable({
  providedIn: 'root'
})
export class BrowseEntityService implements OnInit, OnDestroy {
    public selectedEntityFromGridOrTree$: Subject<DMEntity>;
    public selectedEntity$: BehaviorSubject<DMEntity>;
    public selectedFolder$: BehaviorSubject<DMEntity>;
    public onAddedChildToEntity$: Subject<number>;

    public totalEntitiesToDisplay$: BehaviorSubject<DMEntityWrapper[]>;
    public entitiesToDisplay$: BehaviorSubject<DMEntityWrapper[]>;

    public entitiesPath: Map<number, DMEntity[]>;
    public entitiesPathId: number[];
    public entitiesPathIds: Map<number, number[]>;

    public currentPath: BehaviorSubject<Array<DMEntity>>;

    private subsOk = true;

    private history: Array<number>;
    private historyCurrentIndex: BehaviorSubject<number>;
    public historyBack: Subject<number>;
    public historyForward: Subject<number>;
    public historyNewEntry: Subject<number>;
    public historyHasForward: BehaviorSubject<boolean>;
    public historyHasBackward: BehaviorSubject<boolean>;

    public explorerMode: BehaviorSubject<EXPLORER_MODE>;

    public nodeToRemoveFromTree: Subject<DMEntity>;
    public updateMoveTreeNode$: Subject<TreeNodeMoveUpdate>;

    public shareDocumentReturn$: Subject<boolean>;

    pageSize: number;
    pageIndex: BehaviorSubject<number>;
    length: BehaviorSubject<number>;
    sort: DMEntitySort;
    onNewWorkspace: Subject<number>;
    openEntityFromFileUploadList$: Subject<number>;

    loading$: BehaviorSubject<boolean>;

    public browseMode$: BehaviorSubject<BROWSE_TREE_MODE>;
    public chosenContainerEntityUid$: BehaviorSubject<number>;
    removedFolder$: BehaviorSubject<number>;
    removedWorkspace$: BehaviorSubject<number>;
    removedDocument$: BehaviorSubject<number>;

  constructor(
      // Set the defaults

      private sessionService: SessionService,
      private documentService: DocumentService,
      private workspaceService: WorkspaceService,
      private folderService: FolderService,
      private searchEntityService: SearchEntityService,
      private workspaceSessionService: WorkspaceSessionService,
      private entityCacheService: EntityCacheService
  ) {
      this.selectedEntity$ = new BehaviorSubject(undefined);
      this.selectedFolder$ = new BehaviorSubject<DMEntity>(undefined);
      this.selectedEntityFromGridOrTree$ = new Subject<DMEntity>();
      this.currentPath = new BehaviorSubject<Array<DMEntity>>([]);
      this.entitiesPath = new Map<number, DMEntity[]>();
      this.entitiesPathId = Array<number>();
      // this.entitiesPathValue = Array<Array<number>>();
      this.entitiesPathIds = new Map<number, Array<number>>();

      this.history = new Array<number>();
      this.historyCurrentIndex = new BehaviorSubject<number>(-1);
      this.historyBack = new Subject<number>();
      this.historyForward = new Subject<number>();
      this.historyNewEntry = new Subject<number>();
      this.historyHasForward = new BehaviorSubject<boolean>(false);
      this.historyHasBackward = new BehaviorSubject<boolean>(false);

      this.totalEntitiesToDisplay$ = new BehaviorSubject<DMEntityWrapper[]>([]);
      this.entitiesToDisplay$ = new BehaviorSubject<DMEntityWrapper[]>([]);

      this.pageIndex = new BehaviorSubject<number>(0);
      this.pageSize = PAGE_SIZE_DEFAULT;
      this.length = new BehaviorSubject<number>(undefined);

      this.explorerMode = new BehaviorSubject<EXPLORER_MODE>(EXPLORER_MODE.BROWSE);

      this.nodeToRemoveFromTree = new Subject<DMEntity>();

      this.updateMoveTreeNode$ = new Subject<TreeNodeMoveUpdate>();

      this.onNewWorkspace = new Subject<number>();
      this.onAddedChildToEntity$ = new Subject<number>();

      this.openEntityFromFileUploadList$ = new Subject<number>();

      this.shareDocumentReturn$ = new Subject<boolean>();

      this.loading$ = new BehaviorSubject<boolean>(false);

      this.browseMode$ = new BehaviorSubject<BROWSE_TREE_MODE>(null);

      this.chosenContainerEntityUid$ = new BehaviorSubject<number>(null);

      this.removedFolder$ = new BehaviorSubject<number>(null);
      this.removedWorkspace$ = new BehaviorSubject<number>(null);
      this.removedDocument$ = new BehaviorSubject<number>(null);

      this.ngOnInit();
  }

    updateEntitiesPathCache(next: DMEntity[]): void {
        const lastEntity = next[next.length - 1];
        if (this.entitiesPath.get(lastEntity.uid) === null || this.entitiesPath.get(lastEntity.uid) === undefined) {
            this.entitiesPath.set(lastEntity.uid, next);
        }
        this.entitiesPathId.push(lastEntity.uid);
        const index = this.entitiesPathId.findIndex(elem => elem === lastEntity.uid);
        // next.forEach(elem => this.entities.set(elem.uid, elem));
        // todo : delete
        // this.entitiesPathValue[index] = next.map(elem => elem.uid);
        if (! this.entitiesPathIds.has(lastEntity.uid)) {
        // if (this.entitiesPathIds.get(lastEntity.uid) === null || this.entitiesPath.get(lastEntity.uid) === undefined) {
            this.entitiesPathIds.set(lastEntity.uid, next.map(elem => elem.uid));
        }
    }

    ngOnInit(): void {
        this.currentPath.pipe(
            takeWhile(next => this.subsOk),
            filter(next => next.length > 0)
        ).subscribe(
            next => {
                this.updateEntitiesPathCache(next);
            }
        );

/*    .pipe(
            takeWhile(next => this.subsOk)
        )*/
        this.historyNewEntry.subscribe(
            next => {
                this.history.push(next);
            }
        );

        this.historyCurrentIndex.pipe(
            takeWhile(next => this.subsOk),
            filter(next => next > -1)
        ).subscribe(
            next => {
                this.historyHasForward.next(this.history.length > 1 && next < this.history.length - 1);
                this.historyHasBackward.next(this.history.length > 1 && next > 0);
                this.selectedEntity$.next(this.entityCacheService.getEntity(this.history[next]) ?
                  this.entityCacheService.getEntity(this.history[next]) :
                  undefined);
                if (this.history[next] === undefined) {
                    this.currentPath.next([]);
                } else {
                    if (this.entityCacheService.getEntity(this.history[next]) !== null
                      && this.entityCacheService.getEntity(this.history[next]) !== undefined) {
                        const entity = this.entityCacheService.getEntity(this.history[next]);
                        if (this.entitiesPathIds.get(entity.uid) !== null && this.entitiesPathIds.get(entity.uid) !== undefined) {
                            // const idx = this.entitiesPathId.findIndex(elem => elem === entity.uid);
                            // if (idx !== -1) {
                            // this.currentPath.next(this.entitiesPathValue[entity.uid].map(elem => this.entities.get(elem)));
                            this.currentPath.next(this.entitiesPathIds.get(entity.uid).map(elem => this.entityCacheService.getEntity(elem)));
                        }
                    }
                }
            }
        );

        this.selectedEntity$.subscribe(
            entity => this.selectedFolder$.next(entity)
        );

        this.selectedFolder$.pipe(
            tap(entity => {
                if (entity === undefined) {
                    this.totalEntitiesToDisplay$.next([]);
                    this.entitiesToDisplay$.next([]);
                }
            }),
            tap(entity => {
                this.pageIndex.next(0);
            }),
            filter(entity => entity !== undefined),
            concatMap(res => this.entityCacheService.findEntityChildrenInCache(res.uid, false)),
        ).subscribe(
            res => {
                this.totalEntitiesToDisplay$.next(res);
                // reset this variable to null to inform it has to be filled
                this.makePage(this.pageIndex.getValue(), this.pageSize, this.workspaceSessionService.sort.getValue());
            }
        );

        /*this.explorerMode.pipe(
            filter(next => next === EXPLORER_MODE.SEARCH),
            concatMap(
                next => this.searchEntityService.onFilesChanged
            ),
            map(
                next => this.entitiesToDisplay$.next(next)
            ),
            concatMap(
                next => this.searchEntityService.onTotalFilesChanged
            ),
            map(
                next => this.length.next(next)
            )
        ).subscribe();*/
    }

    setCurrentPathForEntityUid(uid: number): void {
        if (this.entitiesPathIds.get(uid) !== null
            && this.entitiesPathIds.get(uid) !== undefined) {
            // const idx = this.browseEntityService.entitiesPathId.findIndex(elem => elem === Number(uid));
            // if (idx !== -1) {
            this.currentPath.next(this.entitiesPathIds.get(uid).map(elem =>
                this.entityCacheService.getEntity(elem)
            ));
        } else {
            this.entityCacheService.findAllParents(uid, true).subscribe(
                next => {
                    this.currentPath.next(next.reverse());
                }
            );
        }
    }

    setHistoryNewEntry(uid: number): void {
      if (this.historyCurrentIndex.getValue() < this.history.length - 1) {
          this.history = this.history.slice(0, this.historyCurrentIndex.getValue() + 1);
      }
        this.history.push(uid);
    }

    ngOnDestroy(): void {
        this.subsOk = false;
    }

    /*findContainerEntitiesAtPath(parentUid?: number): Observable<DMEntity[]> {
      if (parentUid === null
          || parentUid === undefined) {
        return this.workspaceService.getWorkspaces(this.sessionService.sessionToken).pipe(
          tap(next => next.forEach(entity => {
            if (this.entities.get(entity.uid) === null
              || this.entities.get(entity.uid) === undefined) {
              this.entities.set(entity.uid, entity);
            }
          }))
        );
      } else {
        return this.folderService.getFolders(this.sessionService.sessionToken, parentUid).pipe(
          tap(next => next.forEach(entity => {
            if (this.entities.get(entity.uid) === null
              || this.entities.get(entity.uid) === undefined) {
              this.entities.set(entity.uid, entity);
            }
          }))
        );
      }
    }*/

    /*findEntitiesAtPath(parent?: DMEntity): Observable<DMEntity[]> {
        return this.findEntitiesAtPathFromId((parent === null || parent === undefined) ? null : parent.uid);
    }*/

    retrieveContainerEntity(uid: number): Observable<DMEntity> {
      return this.entityCacheService.findContainerEntityInCache(uid);
    }

    retrieveWorkspaceEntity(uid: number): Observable<Workspace> {
        return this.entityCacheService.findWorkspaceInCache(uid);
    }

    retrieveFolderEntity(uid: number): Observable<Folder> {
        return this.folderService.getFolder(this.sessionService.sessionToken, uid).pipe(
            switchMap(
                res => of(res).catch(error => of(error))
            ),
            catchError(error => {
                return of('');
            }),
            map(res => res)
        );
    }

    goHistoryBack(): void {
        if (this.history.length > 1
            && this.historyCurrentIndex.getValue() > 0) {
            this.historyCurrentIndex.next(this.historyCurrentIndex.getValue() - 1);
        }
    }

    goHistoryForward(): void {
        if (this.history.length > 1
            && this.historyCurrentIndex.getValue() < (this.history.length - 1)) {
            this.historyCurrentIndex.next(this.historyCurrentIndex.getValue() + 1);
        } else {
            if (this.history.length === 1) {
                this.historyCurrentIndex.next(0);
            }
        }
    }

    private isSortedRequired(sort: DMEntitySort): boolean {
        return (
            sort != null
            && sort !== undefined
            && this.sort != null
            && this.sort !== undefined
            && (
                this.sort.name !== sort.name
                || this.sort.direction !== sort.direction
            )
        );
    }

    public makePage(pageIndex: number, pageSize: number, sort?: DMEntitySort): void {
        if (pageSize != null && pageSize !== undefined) {
            this.pageSize = pageSize;
        }

        const totalEntitiesToDisplay = this.totalEntitiesToDisplay$.getValue();
        if (totalEntitiesToDisplay.length <= (this.pageSize * pageIndex)) {
          pageIndex = pageIndex - 1;
        }
        this.pageIndex.next(pageIndex);
        const sortRequired = this.isSortedRequired(sort);
        if (sort != null && sort !== undefined) {
            this.sort = sort;
        }
        const indexBeginning = (this.pageIndex.getValue()) * this.pageSize;
        const indexEnd = indexBeginning + this.pageSize;
        if (this.explorerMode.getValue() === EXPLORER_MODE.BROWSE) {
            const entitiesSorted = (sortRequired || (this.sort != null && this.sort !== undefined)) ?
                this.sortEntities(this.totalEntitiesToDisplay$.getValue().slice(), this.sort) :
                this.totalEntitiesToDisplay$.getValue().slice();
            this.entitiesToDisplay$.next(entitiesSorted.slice(indexBeginning, indexEnd));
        } else {
            this.searchEntityService.changePage(this.pageIndex.getValue(), this.pageSize).subscribe(
                next => this.entitiesToDisplay$.next(
                  next.map(entity => <DMEntityWrapper> {
                    dmEntity: entity,
                    canRead: null,
                    canWrite: null,
                    hasFullAccess: null
                  })
                )
            );
        }
        this.loading$.next(false);
    }

    private sortEntities(entities: Array<DMEntityWrapper>, sort: DMEntitySort): Array<DMEntityWrapper> {
        let fun = null;
        const sortOp = (sort.direction === 'asc') ? 1 : -1;
        switch (sort.name) {
            case 'name':
                fun = (a, b) => {
                    return sortOp * (a.dmEntity.name.localeCompare(b.dmEntity.name));
                };
                break;
            case 'extension':
                fun = (a, b) => {
                    let ret = -1;
                    if (a.dmEntity.extension == null) {
                        if (b.dmEntity.extension == null) {
                            ret = 0;
                        } else {
                            ret = 1;
                        }
                    } else {
                        if (b.dmEntity.extension == null) {
                            ret = -1;
                        } else {
                            ret = a.dmEntity.extension.localeCompare(b.dmEntity.extension);
                        }
                    }
                    return ret === 0 ?
                            a.dmEntity.name.localeCompare(b.dmEntity.name) :
                            sortOp * ret;
                };
                break;
            case 'updateDate':
                fun = (a, b) => {
                    return sortOp * (a.dmEntity.updateDate < b.dmEntity.updateDate ? -1 : 1);
                };
                break;
            default :
        }
        return fun != null ? entities.sort(fun) : entities;
    }

    public deleteCacheEntry(uid: number): void {
      this.entityCacheService.removeEntityInCache(uid);
    }

    /*public deleteCacheDocumentEntry(uid: number): void {
        this.entities.delete(uid);
    }*/

    deleteEntity(entity: DMEntity): Observable<any> {
      return DMEntityUtils.dmEntityIsWorkspace(entity) ?
        this.workspaceService.deleteWorkspace(this.sessionService.sessionToken, entity.uid).pipe(
          tap(() => this.removedWorkspace$.next(entity.uid))
        ) :
        DMEntityUtils.dmEntityIsFolder(entity) ?
          this.folderService.deleteFolder(this.sessionService.sessionToken, entity.uid).pipe(
            // concatMap(() => this.entityCacheService.findDocumentInCache(entity.uid)),
            concatMap(() => this.updateListAfterDelete(entity)),
            // concatMap(() => this.getEntity(doc.folderUid)),
            tap(() => this.removedFolder$.next(entity.uid))
          ) :
          this.documentService.deleteDocument(this.sessionService.sessionToken, entity.uid).pipe(
            concatMap(() => this.updateListAfterDelete(entity)),
            tap(() => this.removedDocument$.next(entity.uid))
          );
    }

    deleteDocument(uid: number): Observable<any> {
      return this.documentService.deleteDocument(this.sessionService.sessionToken, uid);
    }

    updateListAfterDelete(entity: DMEntity): Observable<Array<DMEntityWrapper>> {
        let parentUid: number;
        if (entity['parentUid']) {
            parentUid = entity['parentUid'];
        } else {
            if (entity['folderUid']) {
                parentUid = entity['folderUid'];
            }
        }

        return this.entityCacheService.reloadEntityChildren(parentUid).pipe(
          tap(() => {
            // this.selectedEntity$.next(this.entities.get(parentUid));
            const totalEntities = this.totalEntitiesToDisplay$.getValue().slice();
            const idx = totalEntities.findIndex(elem => elem.dmEntity.uid === entity.uid);
            if (idx !== -1) {
              totalEntities.splice(idx, 1);
              this.totalEntitiesToDisplay$.next(totalEntities);
            }
            if (this.pageIndex.getValue() > Math.floor(totalEntities.length / this.pageSize)) {
              this.pageIndex.next(this.pageIndex.getValue() - 1);
            }
            this.makePage(this.pageIndex.getValue(), this.pageSize);
            this.nodeToRemoveFromTree.next(entity);
          })
        );
    }

    updateListAfterMove(entityMoved: DMEntity, entityTarget: DMEntity, movedEntityInitialParentUid?: number): Observable<Array<DMEntityWrapper>> {
        let parentUid: number;
        if (entityMoved['parentUid']) {
            parentUid = entityMoved['parentUid'];
        } else {
            if (entityMoved['folderUid']) {
                parentUid = entityMoved['folderUid'];
            }
        }

      return this.entityCacheService.reloadEntityChildren(parentUid).pipe(
        concatMap(() => movedEntityInitialParentUid !== null ?
          this.entityCacheService.reloadEntityChildren(movedEntityInitialParentUid) :
          of()
        ),
        tap(() => {
          const totalEntities = this.totalEntitiesToDisplay$.getValue().slice();
          const idx = totalEntities.findIndex(elem => elem.dmEntity.uid === entityMoved.uid);
          const currentPathValue = this.currentPath.getValue();
          if (movedEntityInitialParentUid === currentPathValue[currentPathValue.length - 1].uid) {
            if (idx !== -1) {
              totalEntities.splice(idx, 1);
            }
          } else {
            if (entityTarget.uid === currentPathValue[currentPathValue.length - 1].uid) {
              const entityMovedCacheData = this.entityCacheService.getEntityCacheData(entityMoved.uid);
              const entityMovedWrapper = this.entityCacheService.entityCacheDataToDMEntityWrapper(entityMovedCacheData);
              totalEntities.push(entityMovedWrapper);
            }
          }
          this.totalEntitiesToDisplay$.next(totalEntities);
          /*if ((this.pageIndex.getValue() + 1 - 1) * this.pageSize <= totalEntities.length) {
                this.pageIndex.next(this.pageIndex.getValue() - 1);
            }*/
          this.makePage(this.pageIndex.getValue(), this.pageSize);
        })
      );
    }

    moveEntity(entity: DMEntity, targetEntity: DMEntity): Observable<any> {
        return DMEntityUtils.dmEntityIsFolder(entity) ?
            this.folderService.updateFolder(
                this.sessionService.sessionToken,
                entity.uid,
                entity.name,
                targetEntity.uid
            ) :
            this.documentService.updateDocument(
                this.sessionService.sessionToken,
                entity.uid,
                entity.name,
                entity['extension'],
                entity['mimeType'],
                targetEntity.uid
            );
    }

    /*addNewEntityInCache(entity: DMEntity): void {
      this.entities.set(entity.uid, entity);
    }*/

    /*updateEntityInCache(entity: DMEntity): Observable<DMEntity> {
      if (DMEntityUtils.dmEntityIsDocument(entity)) {
          return this.documentService.getDocument(this.sessionService.sessionToken, entity.uid).pipe(
              tap(doc => this.entities.set(entity.uid, doc)),
              tap(doc => this.entitiesPathIds.set(entity.uid, null))
          );
      } else {
          if (DMEntityUtils.dmEntityIsFolder(entity)) {
              return this.folderService.getFolder(this.sessionService.sessionToken, entity.uid).pipe(
                  tap(doc => this.entities.set(entity.uid, doc)),
                  tap(doc => this.entitiesPathIds.set(entity.uid, null))
              );
          } else {
              return this.workspaceService.getWorkspace(this.sessionService.sessionToken, entity.uid).pipe(
                  tap(doc => this.entities.set(entity.uid, doc)),
                  tap(doc => this.entitiesPathIds.set(entity.uid, null))
              );
          }
      }
    }*/

    /*checkEntityInCache(entityId: number): boolean {
      return this.entities.get(entityId) !== null && this.entities.get(entityId) !== undefined;
    }*/

    goInContainerEntity(entity: DMEntity): void {
        this.selectedEntityFromGridOrTree$.next(entity);
        const currentPath = this.currentPath.getValue();
        if (currentPath.filter(dir => dir.uid === entity.uid).length === 0) {
            currentPath.push(entity);
            this.currentPath.next(currentPath);
        }
    }

    /*getDocument(docId: number): Observable<KimiosDocument> {
        return this.entities.get(docId) != null ?
            of(this.entities.get(docId)) :
            this.documentService.getDocument(this.sessionService.sessionToken, docId).pipe(
                tap(doc => this.entities.set(docId, doc))
            );
    }*/

    getEntity(entityId: number): Observable<DMEntity> {
        return this.entityCacheService.findEntityInCache(entityId);
    }

    computeEntityPath(entityId: number): string {
      return this.appendEntityParentNameRec(entityId, '');
    }

    computeFolderPathEntities(entity: DMEntity): Array<DMEntity> {
      return this.appendEntityParentRec(entity, new Array<DMEntity>());
    }

    appendEntityParentNameRec(entityId: number, path: string): string {
      const entity = this.entityCacheService.getEntity(entityId);
      if (DMEntityUtils.dmEntityIsWorkspace(entity)) {
          return entity.name + '/' + path;
      } else {
          return this.appendEntityParentNameRec(
              DMEntityUtils.dmEntityIsDocument(entity) ?
                  this.entityCacheService.getEntity(entity['folderUid']).uid :
                  this.entityCacheService.getEntity(entity['parentUid']).uid,
              path === '' ?
                  entity.name :
                  entity.name + '/' + path
          );
      }
    }

    private appendEntityParentRec(entity: DMEntity, array: DMEntity[]): Array<DMEntity> {
        if (DMEntityUtils.dmEntityIsWorkspace(entity)) {
            array.unshift(entity);
            return array;
        } else {
            return this.appendEntityParentRec(
                DMEntityUtils.dmEntityIsDocument(entity) ?
                    this.entityCacheService.getEntity(entity['folderUid']) :
                    this.entityCacheService.getEntity(entity['parentUid']),
                array.concat(entity)
            );
        }
    }

    checkMoveIsPossible(entityMoved: DMEntity, entityTarget: DMEntity): boolean {
        return entityMoved.uid !== entityTarget.uid
            && this.entityNotParentOf(entityMoved, entityTarget);
    }

    private entityNotParentOf(entityMoved: DMEntity, entityTarget: DMEntity): boolean {
        return this.computeFolderPathEntities(entityTarget).filter(entity => entity.uid === Number(entityMoved.uid)).length === 0;
    }

    /*reloadEntity(uid: number): Observable<DMEntity> {
        return this.getEntity(uid).pipe(
            concatMap(entity => this.updateEntityInCache(entity))
        );
    }*/

    goToEntity(entity: DMEntity, router: Router): void {
        if (DMEntityUtils.dmEntityIsFolder(entity) || DMEntityUtils.dmEntityIsWorkspace(entity)) {
            DocumentUtils.navigateToFolderOrWorkspace(router, entity.uid);
            // this.goInContainerEntity(entity);
        } else {
            DocumentUtils.navigateToFile(router, entity.uid);
        }
    }

    retrieveWorkspaces(): Observable<Array<Workspace>> {
      return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
    }

  reloadPage(): void {
    this.makePage(this.pageIndex.getValue(), this.pageSize, this.sort);
  }

  addEntityToCurrentEntitiesToDisplay(entity: DMEntityWrapper): boolean {
    let ret = false;
    const currentEntities = this.totalEntitiesToDisplay$.getValue();
    if (currentEntities.findIndex(element => element.dmEntity.uid === entity.dmEntity.uid) === -1) {
      currentEntities.push(entity);
      this.totalEntitiesToDisplay$.next(currentEntities);
      ret = true;
    }

    return ret;
  }

  updateListOnDelete(dmEntityId: number): void {
      const totalEntities = this.totalEntitiesToDisplay$.getValue();
      const idx = totalEntities.findIndex(entity => entity.dmEntity.uid === dmEntityId);
      if (idx !== -1) {
        totalEntities.splice(idx, 1);
        this.totalEntitiesToDisplay$.next(totalEntities);
        this.makePage(this.pageIndex.getValue(), this.pageSize, this.workspaceSessionService.sort.getValue());
      }
  }

  updateListOnCreate(folderId: number): void {
    this.entityCacheService.findContainerEntityInCache(folderId).pipe(
      concatMap(containerEntity => this.entityCacheService.findContainerEntityInCache((containerEntity as Folder).parentUid)),
      filter(parentEntity => parentEntity.uid === this.selectedFolder$.getValue().uid),
      concatMap(res => this.entityCacheService.findEntityChildrenInCache(res.uid, false)),
      tap(children => {
        this.totalEntitiesToDisplay$.next(children);
        // reset this variable to null to inform it has to be filled
        this.makePage(this.pageIndex.getValue(), this.pageSize, this.workspaceSessionService.sort.getValue());
      })
    ).subscribe();
  }
}


