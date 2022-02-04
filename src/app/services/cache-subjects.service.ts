import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {UpdateNoticeParameters} from '../main/model/cache/event/update-notice-parameters';

@Injectable({
  providedIn: 'root'
})
export class CacheSubjectsService {

  public userGroupAdd$: Subject<UpdateNoticeParameters>;
  public userGroupRemove$: Subject<UpdateNoticeParameters>;
  public userCreated$: Subject<UpdateNoticeParameters>;
  public userUpdated$: Subject<UpdateNoticeParameters>;
  public userRemoved$: Subject<UpdateNoticeParameters>;
  public groupCreated$: Subject<UpdateNoticeParameters>;
  public groupUpdated$: Subject<UpdateNoticeParameters>;
  public groupRemoved$: Subject<UpdateNoticeParameters>;
  public workspaceCreated$: Subject<UpdateNoticeParameters>;
  public workspaceUpdated$: Subject<UpdateNoticeParameters>;
  public workspaceRemoved$: Subject<UpdateNoticeParameters>;
  public folderCreated$: Subject<UpdateNoticeParameters>;
  public folderUpdated$: Subject<UpdateNoticeParameters>;
  public folderRemoved$: Subject<UpdateNoticeParameters>;

  constructor() {
    this.userGroupAdd$ = new Subject<UpdateNoticeParameters>();
    this.userGroupRemove$ = new Subject<UpdateNoticeParameters>();
    this.userCreated$ = new Subject<UpdateNoticeParameters>();
    this.userUpdated$ = new Subject<UpdateNoticeParameters>();
    this.userRemoved$ = new Subject<UpdateNoticeParameters>();
    this.groupCreated$ = new Subject<UpdateNoticeParameters>();
    this.groupUpdated$ = new Subject<UpdateNoticeParameters>();
    this.groupRemoved$ = new Subject<UpdateNoticeParameters>();
    this.workspaceCreated$ = new Subject<UpdateNoticeParameters>();
    this.workspaceUpdated$ = new Subject<UpdateNoticeParameters>();
    this.workspaceRemoved$ = new Subject<UpdateNoticeParameters>();
    this.folderCreated$ = new Subject<UpdateNoticeParameters>();
    this.folderUpdated$ = new Subject<UpdateNoticeParameters>();
    this.folderRemoved$ = new Subject<UpdateNoticeParameters>();
  }
}
