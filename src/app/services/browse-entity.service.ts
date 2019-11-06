import {Injectable} from '@angular/core';
import {SessionService} from './session.service';
import {DMEntity, DocumentService, FolderService, SearchService, WorkspaceService} from '../kimios-client-api';
import {TagService} from './tag.service';
import {combineLatest, Observable, of} from 'rxjs';
import {concatMap} from 'rxjs/operators';
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
      private folderService: FolderService,
      private searchService: SearchService,
      private tagService: TagService
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
        if (parent === null
            || parent === undefined) {
            return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
        } else {
            return this.folderService.getFolders(this.sessionService.sessionToken, parent.uid)
                .pipe(
                    concatMap(
                        res => combineLatest(
                            of(res),
                            DMEntityUtils.dmEntityIsWorkspace(parent) ?
                                of([]) :
                                this.documentService.getDocuments(this.sessionService.sessionToken, parent.uid)
                        )

                    ),
                    concatMap(
                        ([folders, documents]) => of(folders.concat(documents))
                    )
                );

        }
    }

}
