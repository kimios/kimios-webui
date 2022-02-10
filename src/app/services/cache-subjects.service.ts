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
  public documentUpdate$: Subject<UpdateNoticeParameters>;
  public documentVersionCreated$: Subject<UpdateNoticeParameters>;
  public documentVersionUpdated$: Subject<UpdateNoticeParameters>;
  public documentRemoved$: Subject<UpdateNoticeParameters>;
  public documentCheckout$: Subject<UpdateNoticeParameters>;
  public documentCheckin$: Subject<UpdateNoticeParameters>;
  public documentAddRelated$: Subject<UpdateNoticeParameters>;
  public documentRemoveRelated$: Subject<UpdateNoticeParameters>;
  public documentVersionCreate$: Subject<UpdateNoticeParameters>;
  public documentVersionCreateFromLatest$: Subject<UpdateNoticeParameters>;
  public documentVersionUpdate$: Subject<UpdateNoticeParameters>;
  public documentVersionRead$: Subject<UpdateNoticeParameters>;
  public metaValueUpdate$: Subject<UpdateNoticeParameters>;
  public documentVersionCommentCreate$: Subject<UpdateNoticeParameters>;
  public documentVersionCommentUpdate$: Subject<UpdateNoticeParameters>;
  public documentVersionCommentDelete$: Subject<UpdateNoticeParameters>;
  public documentTrash$: Subject<UpdateNoticeParameters>;
  public documentUntrash$: Subject<UpdateNoticeParameters>;
  public documentShared$: Subject<UpdateNoticeParameters>;

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
    this.documentUpdate$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionCreated$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionUpdated$ = new Subject<UpdateNoticeParameters>();
    this.documentRemoved$ = new Subject<UpdateNoticeParameters>();
    this.documentCheckout$ = new Subject<UpdateNoticeParameters>();
    this.documentCheckin$ = new Subject<UpdateNoticeParameters>();
    this.documentAddRelated$ = new Subject<UpdateNoticeParameters>();
    this.documentRemoveRelated$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionCreate$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionCreateFromLatest$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionUpdate$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionRead$ = new Subject<UpdateNoticeParameters>();
    this.metaValueUpdate$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionCommentCreate$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionCommentUpdate$ = new Subject<UpdateNoticeParameters>();
    this.documentVersionCommentDelete$ = new Subject<UpdateNoticeParameters>();
    this.documentTrash$ = new Subject<UpdateNoticeParameters>();
    this.documentUntrash$ = new Subject<UpdateNoticeParameters>();
    this.documentShared$ = new Subject<UpdateNoticeParameters>();
  }
}
