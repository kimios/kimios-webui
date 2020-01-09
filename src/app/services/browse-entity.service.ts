import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {SessionService} from './session.service';
import {DMEntity, DocumentService, Folder, FolderService, Workspace, WorkspaceService} from '../kimios-client-api';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {catchError, concatMap, expand, filter, map, switchMap, takeWhile, tap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

@Injectable({
  providedIn: 'root'
})
export class BrowseEntityService implements OnInit, OnDestroy {
    public selectedEntity$: BehaviorSubject<DMEntity>;

    public loadedEntities: Map<number, DMEntity[]>;
    public entitiesPath: Map<number, DMEntity[]>;
    public entities: Map<number, DMEntity>;

    public currentPath: BehaviorSubject<Array<DMEntity>>;

    private subsOk = true;

  constructor(
      // Set the defaults

      private sessionService: SessionService,
      private documentService: DocumentService,
      private workspaceService: WorkspaceService,
      private folderService: FolderService
  ) {
      this.selectedEntity$ = new BehaviorSubject(undefined);
      this.loadedEntities = new Map<number, DMEntity[]>();
      this.currentPath = new BehaviorSubject<Array<DMEntity>>([]);
      this.entitiesPath = new Map<number, DMEntity[]>();
      // this.history = new Array<number>();
      this.entities = new Map<number, DMEntity>();
  }

    ngOnInit(): void {
        this.currentPath.pipe(
            takeWhile(next => this.subsOk)
        ).subscribe(
            next => this.entitiesPath.set(next.reverse()[0].uid, next)
        );
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
                res => res !== undefined && DMEntityUtils.dmEntityIsFolder(res) ?
                    this.retrieveContainerEntity(res['parentUid']) :
                    of()
            ),
            map(res => res),
            filter(res => includeEntity || res.uid !== uid)
        );
    }

    findAllParents(uid: number, includeEntity: boolean = false): Observable<Array<DMEntity>> {
        const parents = new Array<DMEntity>();
        return this.findAllParentsRec(uid, includeEntity).pipe(toArray());
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
}


