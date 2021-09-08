import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {DMEntity, Document as KimiosDocument, DocumentService, Folder, FolderService, Workspace, WorkspaceService} from 'app/kimios-client-api';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {catchError, concatMap, expand, filter, map, switchMap, takeWhile, tap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {SearchEntityService} from 'app/services/searchentity.service';
import {TreeNodeMoveUpdate} from 'app/main/model/tree-node-move-update';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {Router} from '@angular/router';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';

const PAGE_SIZE_DEFAULT = 20;

export enum EXPLORER_MODE {
    BROWSE = 0,
    SEARCH = 1
}

@Injectable({
  providedIn: 'root'
})
export class BrowseEntityService implements OnInit, OnDestroy {
    public selectedEntityFromGridOrTree$: BehaviorSubject<DMEntity>;
    public selectedEntity$: BehaviorSubject<DMEntity>;
    public selectedFolder$: BehaviorSubject<DMEntity>;
    public onAddedChildToEntity$: Subject<number>;

    public totalEntitiesToDisplay$: BehaviorSubject<DMEntity[]>;
    public entitiesToDisplay$: BehaviorSubject<DMEntity[]>;

    public loadedEntities: Map<number, DMEntity[]>;
    public entitiesPath: Map<number, DMEntity[]>;
    public entitiesPathId: number[];
    public entitiesPathValue: number[][];
    public entitiesPathIds: Map<number, number[]>;

    public entities: Map<number, DMEntity>;

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

  constructor(
      // Set the defaults

      private sessionService: SessionService,
      private documentService: DocumentService,
      private workspaceService: WorkspaceService,
      private folderService: FolderService,
      private searchEntityService: SearchEntityService,
      private workspaceSessionService: WorkspaceSessionService
  ) {
      this.selectedEntity$ = new BehaviorSubject(undefined);
      this.selectedFolder$ = new BehaviorSubject<DMEntity>(undefined);
      this.selectedEntityFromGridOrTree$ = new BehaviorSubject<DMEntity>(undefined);
      this.loadedEntities = new Map<number, DMEntity[]>();
      this.currentPath = new BehaviorSubject<Array<DMEntity>>([]);
      this.entitiesPath = new Map<number, DMEntity[]>();
      this.entitiesPathId = Array<number>();
      this.entitiesPathValue = Array<Array<number>>();
      this.entitiesPathIds = new Map<number, Array<number>>();

      this.history = new Array<number>();
      this.entities = new Map<number, DMEntity>();
      this.historyCurrentIndex = new BehaviorSubject<number>(-1);
      this.historyBack = new Subject<number>();
      this.historyForward = new Subject<number>();
      this.historyNewEntry = new Subject<number>();
      this.historyHasForward = new BehaviorSubject<boolean>(false);
      this.historyHasBackward = new BehaviorSubject<boolean>(false);

      this.totalEntitiesToDisplay$ = new BehaviorSubject<DMEntity[]>([]);
      this.entitiesToDisplay$ = new BehaviorSubject<DMEntity[]>([]);

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

      this.ngOnInit();
  }

    updateEntitiesPathCache(next: DMEntity[]): void {
        const lastEntity = next[next.length - 1];
        if (this.entitiesPath.get(lastEntity.uid) === null || this.entitiesPath.get(lastEntity.uid) === undefined) {
            this.entitiesPath.set(lastEntity.uid, next);
        }
        this.entitiesPathId.push(lastEntity.uid);
        const index = this.entitiesPathId.findIndex(elem => elem === lastEntity.uid);
        next.forEach(elem => this.entities.set(elem.uid, elem));
        this.entitiesPathValue[index] = next.map(elem => elem.uid);
        if (! this.entitiesPathIds.has(lastEntity.uid)) {
        // if (this.entitiesPathIds.get(lastEntity.uid) === null || this.entitiesPath.get(lastEntity.uid) === undefined) {
            this.entitiesPathIds.set(lastEntity.uid, next.map(elem => elem.uid));
        }
        console.log('entitiesPath');
        // console.log(this.entitiesPathId);
        // console.log(this.entitiesPathValue);
        console.log(this.entitiesPathIds);
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
                console.log(this.history);
                this.historyHasForward.next(this.history.length > 1 && next < this.history.length - 1);
                this.historyHasBackward.next(this.history.length > 1 && next > 0);
                this.selectedEntity$.next(this.entities.get(this.history[next]) ? this.entities.get(this.history[next]) : undefined);
                if (this.history[next] === undefined) {
                    this.currentPath.next([]);
                } else {
                    if (this.entities.get(this.history[next]) !== null && this.entities.get(this.history[next]) !== undefined) {
                        const entity = this.entities.get(this.history[next]);
                        if (this.entitiesPathIds.get(entity.uid) !== null && this.entitiesPathIds.get(entity.uid) !== undefined) {
                            // const idx = this.entitiesPathId.findIndex(elem => elem === entity.uid);
                            // if (idx !== -1) {
                            // this.currentPath.next(this.entitiesPathValue[entity.uid].map(elem => this.entities.get(elem)));
                            this.currentPath.next(this.entitiesPathIds.get(entity.uid).map(elem => this.entities.get(elem)));
                        }
                    }
                }
            }
        );

        this.selectedEntityFromGridOrTree$.pipe(
            filter(res => this.browseMode$.getValue() === BROWSE_TREE_MODE.BROWSE)
        )
            .subscribe(
            next => {
                this.setHistoryNewEntry(next === undefined ? undefined : next.uid);
                this.goHistoryForward();
                if (next !== undefined) {
                    this.setCurrentPathForEntityUid(next.uid);
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
            concatMap(res => this.findEntitiesAtPath(res)),
        ).subscribe(
            res => {
                this.totalEntitiesToDisplay$.next(res);
                // reset this variable to null to inform it has to be filled
                this.makePage(this.pageIndex.getValue(), this.pageSize, this.workspaceSessionService.sort.getValue());
            }
        );

        this.explorerMode.pipe(
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
        ).subscribe();
    }

    setCurrentPathForEntityUid(uid: number): void {
        if (this.entitiesPathIds.get(uid) !== null
            && this.entitiesPathIds.get(uid) !== undefined) {
            // const idx = this.browseEntityService.entitiesPathId.findIndex(elem => elem === Number(uid));
            // if (idx !== -1) {
            this.currentPath.next(this.entitiesPathIds.get(uid).map(elem =>
                this.entities.get(elem)
            ));
        } else {
            this.findAllParents(uid, true).subscribe(
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

    findContainerEntitiesAtPath(parentUid?: number): Observable<DMEntity[]> {
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
  }

    findEntitiesAtPath(parent?: DMEntity): Observable<DMEntity[]> {
        return this.findEntitiesAtPathFromId((parent === null || parent === undefined) ? null : parent.uid);
    }

    findEntitiesAtPathFromId(parentUid?: number): Observable<DMEntity[]> {
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
            return (this.loadedEntities.get(parentUid) !== null
                && this.loadedEntities.get(parentUid) !== undefined) ?
                of(this.loadedEntities.get(parentUid)) :
                this.retrieveContainerEntity(parentUid).pipe(
                    concatMap(
                        res => combineLatest(of(res), this.folderService.getFolders(this.sessionService.sessionToken, parentUid))
                    ),
                    concatMap(
                        ([parentEntity, folders]) => combineLatest(
                            of(folders),
                            DMEntityUtils.dmEntityIsWorkspace(parentEntity) ?
                                of([]) :
                                this.documentService.getDocuments(this.sessionService.sessionToken, parentUid)
                        )

                    ),
                    concatMap(
                        ([folders, documents]) => of(folders.concat(documents))
                    ),
                    tap(
                        entities => this.loadedEntities.set(parentUid, entities)
                    ),
                    tap(next => next.forEach(entity => {
                        if (this.entities.get(entity.uid) === null
                            || this.entities.get(entity.uid) === undefined) {
                            this.entities.set(entity.uid, entity);
                        }
                    }))
                );
        }
    }

    findAllParentsRec(uid: number, includeEntity: boolean = false): Observable<DMEntity> {
        return this.retrieveContainerEntity(uid).pipe(
            expand(
                res => res !== undefined && (DMEntityUtils.dmEntityIsFolder(res) /*|| DMEntityUtils.dmEntityIsWorkspace(res)*/) ?
                    this.retrieveContainerEntity(res['parentUid']) :
                    of()
            ),
            map(res => res),
            filter(res => includeEntity || res.uid !== uid)
        );
    }

    findAllParents(uid: number, includeEntity: boolean = false): Observable<Array<DMEntity>> {
        const parents = new Array<DMEntity>();
        return this.findAllParentsRec(uid, includeEntity).pipe(
            filter(elem => elem !== null && elem !== undefined && elem !== ''),
            toArray()
        );
    }

    retrieveContainerEntity(uid: number): Observable<DMEntity> {
        const entity = this.entities.get(uid);
        return entity !== null && entity !== undefined ?
            of(this.entities.get(uid)) :
            this.retrieveFolderEntity(uid).pipe(
                concatMap(
                    res => (res === null || res === undefined || res === '') ?
                        this.retrieveWorkspaceEntity(uid) :
                        of(res)
                )
            );
    }

    retrieveWorkspaceEntity(uid: number): Observable<Workspace> {
        return this.workspaceService.getWorkspace(this.sessionService.sessionToken, uid).pipe(
            switchMap(
                res => of(res).catch(error => of(error))
            ),
            catchError(error => {
                console.log(error);
                return of('');
            }),
            map(res => res)
        );
    }

    retrieveFolderEntity(uid: number): Observable<Folder> {
        return this.folderService.getFolder(this.sessionService.sessionToken, uid).pipe(
            switchMap(
                res => of(res).catch(error => of(error))
            ),
            catchError(error => {
                console.log(error);
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
                next => this.entitiesToDisplay$.next(next)
            );
        }
        this.loading$.next(false);
    }

    private sortEntities(entities: Array<DMEntity>, sort: DMEntitySort): Array<DMEntity> {
        let fun = null;
        const sortOp = (sort.direction === 'asc') ? 1 : -1;
        switch (sort.name) {
            case 'name':
                fun = (a, b) => {
                    return sortOp * (a.name.localeCompare(b.name));
                };
                break;
            case 'extension':
                fun = (a, b) => {
                    let ret = -1;
                    if (a.extension == null) {
                        if (b.extension == null) {
                            ret = 0;
                        } else {
                            ret = 1;
                        }
                    } else {
                        if (b.extension == null) {
                            ret = -1;
                        } else {
                            ret = a.extension.localeCompare(b.extension);
                        }
                    }
                    return ret === 0 ?
                            a.name.localeCompare(b.name) :
                            sortOp * ret;
                };
                break;
            case 'updateDate':
                fun = (a, b) => {
                    return sortOp * (a.updateDate < b.updateDate ? -1 : 1);
                };
                break;
            default :
        }
        return fun != null ? entities.sort(fun) : entities;
    }

    public deleteCacheEntry(uid: number): void {
      this.loadedEntities.delete(uid);
    }

    public deleteCacheDocumentEntry(uid: number): void {
        this.entities.delete(uid);
    }

    deleteEntity(entity: DMEntity): void {
        if (DMEntityUtils.dmEntityIsWorkspace(entity)) {
            this.workspaceService.deleteWorkspace(this.sessionService.sessionToken, entity.uid).subscribe(
                () => console.log('TODO: delete workspace tree node')
            );
        } else {
            if (DMEntityUtils.dmEntityIsFolder(entity)) {
                this.folderService.deleteFolder(this.sessionService.sessionToken, entity.uid).subscribe(
                    () => {
                        console.log('TODO: delete folder tree node');
                        this.updateListAfterDelete(entity);
                    }
                );
            } else {
                if (DMEntityUtils.dmEntityIsDocument(entity)) {
                    this.documentService.deleteDocument(this.sessionService.sessionToken, entity.uid).subscribe(
                        () => this.updateListAfterDelete(entity)
                    );
                }
            }
        }
    }

    deleteDocument(uid: number): Observable<any> {
      return this.documentService.deleteDocument(this.sessionService.sessionToken, uid);
    }

    updateListAfterDelete(entity: DMEntity): void {
        let parentUid: number;
        if (entity['parentUid']) {
            parentUid = entity['parentUid'];
        } else {
            if (entity['folderUid']) {
                parentUid = entity['folderUid'];
            }
        }

        this.deleteCacheEntry(parentUid);
        // this.selectedEntity$.next(this.entities.get(parentUid));
        const totalEntities = this.totalEntitiesToDisplay$.getValue().slice();
        const idx = totalEntities.findIndex(elem => elem.uid === entity.uid);
        if (idx !== -1) {
            totalEntities.splice(idx, 1);
            this.totalEntitiesToDisplay$.next(totalEntities);
        }
        if ((this.pageIndex.getValue() + 1 - 1) * this.pageSize <= totalEntities.length) {
            this.pageIndex.next(this.pageIndex.getValue() - 1);
        }
        this.makePage(this.pageIndex.getValue(), this.pageSize);
        this.nodeToRemoveFromTree.next(entity);
    }

    updateListAfterMove(entityMoved: DMEntity, entityTarget: DMEntity): void {
        let parentUid: number;
        if (entityMoved['parentUid']) {
            parentUid = entityMoved['parentUid'];
        } else {
            if (entityMoved['folderUid']) {
                parentUid = entityMoved['folderUid'];
            }
        }

        this.deleteCacheEntry(parentUid);
        this.deleteCacheEntry(entityTarget.uid);
        const totalEntities = this.totalEntitiesToDisplay$.getValue().slice();
        const idx = totalEntities.findIndex(elem => elem.uid === entityMoved.uid);
        if (idx !== -1) {
            totalEntities.splice(idx, 1);
            this.totalEntitiesToDisplay$.next(totalEntities);
        }
        /*if ((this.pageIndex.getValue() + 1 - 1) * this.pageSize <= totalEntities.length) {
            this.pageIndex.next(this.pageIndex.getValue() - 1);
        }*/
        this.makePage(this.pageIndex.getValue(), this.pageSize);
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

    addNewEntityInCache(entity: DMEntity): void {
      this.entities.set(entity.uid, entity);
    }

    updateEntityInCache(entity: DMEntity): Observable<DMEntity> {
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
    }

    checkEntityInCache(entityId: number): boolean {
      return this.entities.get(entityId) !== null && this.entities.get(entityId) !== undefined;
    }

    goInContainerEntity(entity: DMEntity): void {
        this.selectedEntityFromGridOrTree$.next(entity);
        const currentPath = this.currentPath.getValue();
        if (currentPath.filter(dir => dir.uid === entity.uid).length === 0) {
            currentPath.push(entity);
            this.currentPath.next(currentPath);
        }
    }

    getDocument(docId: number): Observable<KimiosDocument> {
        return this.entities.get(docId) != null ?
            of(this.entities.get(docId)) :
            this.documentService.getDocument(this.sessionService.sessionToken, docId).pipe(
                tap(doc => this.entities.set(docId, doc))
            );
    }

    getEntity(entityId: number): Observable<DMEntity> {
        return this.entities.get(entityId) != null ?
            of(this.entities.get(entityId)) :
            this.retrieveContainerEntity(entityId).pipe(
                concatMap(
                    res => (res === null || res === undefined || res === '') ?
                        this.getDocument(entityId) :
                        of(res)
                )
            );
    }

    computeEntityPath(entityId: number): string {
      return this.appendEntityParentNameRec(entityId, '');
    }

    computeFolderPathEntities(entity: DMEntity): Array<DMEntity> {
      return this.appendEntityParentRec(entity, new Array<DMEntity>());
    }

    appendEntityParentNameRec(entityId: number, path: string): string {
      const entity = this.entities.get(entityId);
      if (DMEntityUtils.dmEntityIsWorkspace(entity)) {
          return entity.name + '/' + path;
      } else {
          return this.appendEntityParentNameRec(
              DMEntityUtils.dmEntityIsDocument(entity) ?
                  this.entities.get(entity['folderUid']).uid :
                  this.entities.get(entity['parentUid']).uid,
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
                    this.entities.get(entity['folderUid']) :
                    this.entities.get(entity['parentUid']),
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

    reloadEntity(uid: number): Observable<DMEntity> {
        return this.getEntity(uid).pipe(
            concatMap(entity => this.updateEntityInCache(entity))
        );
    }

    goToEntity(entity: DMEntity, router: Router): void {
        if (DMEntityUtils.dmEntityIsFolder(entity) || DMEntityUtils.dmEntityIsWorkspace(entity)) {
            DocumentUtils.navigateToFolderOrWorkspace(router, entity.uid);
            // this.goInContainerEntity(entity);
        } else {
            DocumentUtils.navigateToFile(router, entity.uid);
        }
    }
}


