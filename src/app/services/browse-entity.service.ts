import {Injectable} from '@angular/core';
import {SessionService} from './session.service';
import {DMEntity, DocumentService, Folder, FolderService, Workspace, WorkspaceService} from '../kimios-client-api';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {catchError, concatMap, expand, filter, map, switchMap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

@Injectable({
  providedIn: 'root'
})
export class BrowseEntityService {

    public selectedEntity$: BehaviorSubject<DMEntity>;

  constructor(
      // Set the defaults

      private sessionService: SessionService,
      private documentService: DocumentService,
      private workspaceService: WorkspaceService,
      private folderService: FolderService
  ) {
      this.selectedEntity$ = new BehaviorSubject(undefined);
  }

  findContainerEntitiesAtPath(parentUid?: number): Observable<DMEntity[]> {
    if (parentUid === null
        || parentUid === undefined) {
      return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
    } else {
      return this.folderService.getFolders(this.sessionService.sessionToken, parentUid);
    }
  }

    findEntitiesAtPath(parent?: DMEntity): Observable<DMEntity[]> {
        return this.findEntitiesAtPathFromId((parent === null || parent === undefined) ? null : parent.uid);
    }

    findEntitiesAtPathFromId(parentUid?: number): Observable<DMEntity[]> {
        if (parentUid === null
            || parentUid === undefined) {
            return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
        } else {
            return this.retrieveContainerEntity(parentUid)
                .pipe(
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
                    )
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


