import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {SessionService} from './session.service';
import {DMEntity, DocumentService, Folder, FolderService, Workspace, WorkspaceService} from '../kimios-client-api';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {catchError, concatMap, expand, filter, map, switchMap, takeWhile, tap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {SearchEntityService} from './searchentity.service';
import {TreeNodeMoveUpdate} from 'app/main/model/tree-node-move-update';

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

    pageSize: number;
    pageIndex: BehaviorSubject<number>;
    length: BehaviorSubject<number>;
    onNewWorkspace: Subject<number>;
    openEntityFromFileUploadList$: Subject<number>;

  constructor(
      // Set the defaults

      private sessionService: SessionService,
      private documentService: DocumentService,
      private workspaceService: WorkspaceService,
      private folderService: FolderService,
      private searchEntityService: SearchEntityService
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

        this.selectedEntityFromGridOrTree$.subscribe(
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
                this.makePage(this.pageIndex.getValue(), this.pageSize);
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
      if (this.historyCurrentIndex.getValue() < this.history.length - 1) {
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
        return this.retrieveFolderEntity(uid).pipe(
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

    public makePage(pageIndex: number, pageSize: number): void {
        this.pageSize = pageSize;
        this.pageIndex.next(pageIndex);
        const indexBeginning = (this.pageIndex.getValue()) * this.pageSize;
        const indexEnd = indexBeginning + this.pageSize;
        if (this.explorerMode.getValue() === EXPLORER_MODE.BROWSE) {
            this.entitiesToDisplay$.next(this.totalEntitiesToDisplay$.getValue().slice(indexBeginning, indexEnd));
        } else {
            this.searchEntityService.changePage(this.pageIndex.getValue(), this.pageSize).subscribe(
                next => this.entitiesToDisplay$.next(next)
            );
        }
    }

    public deleteCacheEntry(uid: number): void {
      this.loadedEntities.delete(uid);
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

    checkEntityInCache(entityId: number): boolean {
      return this.entities.get(entityId) !== null && this.entities.get(entityId) !== undefined;
    }
}


