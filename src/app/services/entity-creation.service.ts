import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {FolderService, WorkspaceService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {UserOrGroup} from 'app/main/model/user-or-group';

@Injectable({
  providedIn: 'root'
})
export class EntityCreationService {

  public newUserOrGroupTmp$: Subject<UserOrGroup>;
  public removedUserOrGroupTmp$: Subject<UserOrGroup>;
  public onFormSubmitted$: Subject<number>;
  public onFormSecuritiesSubmitted$: Subject<boolean>;

  constructor(
      private workspaceService: WorkspaceService,
      private folderService: FolderService,
      private sessionService: SessionService
  ) {
    this.newUserOrGroupTmp$ = new Subject<UserOrGroup>();
    this.removedUserOrGroupTmp$ = new Subject<UserOrGroup>();
    this.onFormSubmitted$ = new Subject<number>();
    this.onFormSecuritiesSubmitted$ = new Subject<boolean>();
  }

  createContainerEntity(entityName: string, entityType: string, parentId?: number): Observable<number> {
    return entityType === 'workspace' && (parentId === null || parentId === undefined) ?
        this.workspaceService.createWorkspace(this.sessionService.sessionToken, entityName) :
        this.folderService.createFolder(this.sessionService.sessionToken, entityName, parentId);
  }
}
