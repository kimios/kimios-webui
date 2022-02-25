import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {CacheUpdateMessage} from 'app/main/model/cache-update-message';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {webSocket} from 'rxjs/webSocket';
import {UpdateNoticeMessageImpl} from 'app/main/model/update-notice-message-impl';
import {UpdateNoticeMessage} from 'app/kimios-client-api/model/updateNoticeMessage';
import {Document as KimiosDocument} from 'app/kimios-client-api/model/document';
import {DataMessageImpl} from 'app/main/model/data-message-impl';
import {UpdateNoticeParameters} from 'app/main/model/cache/event/update-notice-parameters';
import {CacheSubjectsService} from './cache-subjects.service';
import UpdateNoticeTypeEnum = UpdateNoticeMessage.UpdateNoticeTypeEnum;

export enum CacheEnum {
  SHARES_BY_ME= 'shares by me',
  SHARES_WITH_ME= 'shares with me',
  DOCUMENT= 'document',
  FOLDER= 'folder',
  WORKSPACE= 'workspace'
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  public behaviourSubjects: Map<string, BehaviorSubject<CacheUpdateMessage>>;
  private _webSocket: WebSocketSubject<any>;
  private wsToken: string;
  public documentCreated$: Subject<KimiosDocument>;
  public sharedWithMe$: Subject<boolean>;
  public sharedByMe$: Subject<boolean>;
  private _dataMessages: Array<DataMessageImpl>;

  constructor(
    private cacheSubjectsService: CacheSubjectsService
  ) {
    this.behaviourSubjects = new Map<string, BehaviorSubject<CacheUpdateMessage>>();
    Object.keys(CacheEnum).forEach(key => this.behaviourSubjects.set(key, new BehaviorSubject<CacheUpdateMessage>(null)));
    this._webSocket = null;
    this.documentCreated$ = new Subject<KimiosDocument>();
    this.sharedWithMe$ = new Subject<boolean>();
    this.sharedByMe$ = new Subject<boolean>();
    this._dataMessages = new Array<DataMessageImpl>();
  }

  get webSocket(): WebSocketSubject<any> {
    return this._webSocket;
  }

  public initWebSocket(url: string, wsToken: string): void {
    wsToken = wsToken;
    url = url + wsToken;
    this._webSocket = webSocket(url.replace('http', 'ws'));
    this._webSocket.subscribe(
        msg => {
          console.log('message received: ' + msg);
          console.dir(msg);
          this.handleMsg(msg);
        },
        // Called whenever there is a message from the server
        err => console.log(err),
        // Called if WebSocket API signals some kind of error
        () => console.log('complete')
        // Called when connection is closed (for whatever reason)
    );
  }

  private handleMsg(msg: any): void {
    if (msg['updateNoticeType'] != null) {
      const updateNoticeMessage = Object.assign(new UpdateNoticeMessageImpl(null, null, null, null), msg);
      console.log('Websocket received message: ');
      console.dir(updateNoticeMessage);
      this.handleUpdateNoticeMsg(updateNoticeMessage);
    } else {
      if (msg['dmEntityList'] != null && msg['parent'] != null) {
        const dataMessage = Object.assign(new DataMessageImpl(null, null, null, null), msg);
        this.handleDataMessage(dataMessage);
      }
    }
  }

  private handleUpdateNoticeMsg(updateNoticeMessage: UpdateNoticeMessageImpl): void {
      const messageParsedObj = updateNoticeMessage.message != null ? JSON.parse(updateNoticeMessage.message) : null;
      const obj: UpdateNoticeParameters = {};
      
      switch (updateNoticeMessage.updateNoticeType) {
        case UpdateNoticeTypeEnum.KEEPALIVEPING:
          const updateNoticeMessageImpl = new UpdateNoticeMessageImpl(
            UpdateNoticeTypeEnum.KEEPALIVEPONG,
            this.wsToken,
            null,
            null
          );
          this._webSocket.next(updateNoticeMessageImpl);
          break;
        case UpdateNoticeTypeEnum.DOCUMENT:
          const docEmpty: KimiosDocument = {};
          if (messageParsedObj != null ) {
            const doc = Object.assign(docEmpty, messageParsedObj);
            this.documentCreated$.next(doc);
          }
          break;
        case UpdateNoticeTypeEnum.SHARESWITHME:
          this.sharedWithMe$.next(true);
          break;
        case UpdateNoticeTypeEnum.SHARESBYME:
          this.sharedByMe$.next(true);
          break;
        case UpdateNoticeTypeEnum.USERGROUPADD:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.userGroupAdd$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.USERGROUPREMOVE:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.userGroupRemove$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.USERCREATED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.userCreated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.USERMODIFIED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.userUpdated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.USERREMOVED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.userRemoved$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.GROUPCREATED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.groupCreated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.GROUPMODIFIED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.groupUpdated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.GROUPREMOVED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.groupRemoved$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.WORKSPACECREATED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.workspaceCreated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.WORKSPACEUPDATED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.workspaceUpdated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.WORKSPACEREMOVED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.workspaceRemoved$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.FOLDERCREATED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.folderCreated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.FOLDERUPDATED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.folderUpdated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.FOLDERREMOVED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.folderRemoved$.next(o);
          }
          break;

        case UpdateNoticeTypeEnum.DOCUMENTUPDATE:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentUpdate$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTREMOVED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentRemoved$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTCHECKOUT:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentCheckout$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTCHECKIN:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentCheckin$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTADDRELATED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentAddRelated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTREMOVERELATED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentRemoveRelated$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTVERSIONCREATE:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentVersionCreate$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTVERSIONCREATEFROMLATEST:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentVersionCreateFromLatest$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTVERSIONUPDATE:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentVersionUpdate$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTVERSIONREAD:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentVersionRead$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.METAVALUEUPDATE:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.metaValueUpdate$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTVERSIONCOMMENTCREATE:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentVersionCommentCreate$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTVERSIONCOMMENTUPDATE:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentVersionCommentUpdate$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTVERSIONCOMMENTDELETE:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentVersionCommentDelete$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTTRASH:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.folderRemoved$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTUNTRASH:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentTrash$.next(o);
          }
          break;
        case UpdateNoticeTypeEnum.DOCUMENTSHARED:
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.cacheSubjectsService.documentShared$.next(o);
          }
          break;
      }
    }

  private handleDataMessage(dataMessage: DataMessageImpl): void {
    this._dataMessages.push(dataMessage);
  }

  get dataMessages(): Array<DataMessageImpl> {
    return this._dataMessages;
  }
}
