import {Injectable} from '@angular/core';
import {SessionService} from './session.service';
import {DMEntity, DocumentService, Folder, FolderService, Workspace, WorkspaceService} from '../kimios-client-api';
import {combineLatest, Observable, of} from 'rxjs';
import {catchError, concatMap, expand, filter, map, switchMap} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

@Injectable({
  providedIn: 'root'
})
export class BrowseEntityService {

  constructor(
      // Set the defaults

      private sessionService: SessionService,
      private documentService: DocumentService,
      private workspaceService: WorkspaceService,
      private folderService: FolderService
  ) {

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
            return this.folderService.getFolders(this.sessionService.sessionToken, parentUid)
                .pipe(
                    concatMap(
                        res => combineLatest(
                            of(res),
                            DMEntityUtils.dmEntityIsWorkspace(parent) ?
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

    findAllParents(uid: number): Observable<DMEntity> {
        return this.retrieveContainerEntity(uid).pipe(
            expand(
                res => res !== undefined && DMEntityUtils.dmEntityIsFolder(res) ?
                    this.retrieveContainerEntity(res['parentUid']) :
                    of()
            ),
            map(res => res),
            filter(res => res.uid !== uid)
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
}


