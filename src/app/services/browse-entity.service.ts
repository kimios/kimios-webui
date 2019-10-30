import { Injectable } from '@angular/core';
import {SessionService} from './session.service';
import {DMEntity, DocumentService, Folder, FolderService, SearchService, WorkspaceService} from '../kimios-client-api';
import {TagService} from './tag.service';
import {currentId} from 'async_hooks';
import {combineLatest, Observable, of} from 'rxjs';
import {map, concatMap} from 'rxjs/operators';
import {DMEntityImpl} from '../kimios-client-api/model/dMEntityImpl';

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

  findEntitiesAtPath(parentUid?: number): Observable<DMEntity[]> {
    if (parentUid === null
        || parentUid === undefined) {
      return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
    } else {
      return this.folderService.getFolders(this.sessionService.sessionToken, parentUid)
          .pipe(
              concatMap(
                  res => {
                    return combineLatest(
                        of(res),
                        this.documentService.getDocuments(this.sessionService.sessionToken, parentUid)
                    );
                  }
              ),
              concatMap(
                  ([folders, documents]) => of(folders.concat(documents))
              )
          );
    }
  }

}
