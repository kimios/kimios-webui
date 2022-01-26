import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {CacheUpdateMessage} from 'app/main/model/cache-update-message';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {webSocket} from 'rxjs/webSocket';
import {UpdateNoticeMessageImpl} from 'app/main/model/update-notice-message-impl';
import {UpdateNoticeMessage} from 'app/kimios-client-api/model/updateNoticeMessage';
import {Document as KimiosDocument} from 'app/kimios-client-api/model/document';
import {DataMessageImpl} from 'app/main/model/data-message-impl';
import UpdateNoticeTypeEnum = UpdateNoticeMessage.UpdateNoticeTypeEnum;
import {UserGroupAdd} from 'app/main/model/cache/event/user-group-add';

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
  private webSocket: WebSocketSubject<any>;
  private wsToken: string;
  public documentCreated$: Subject<KimiosDocument>;
  public sharedWithMe$: Subject<boolean>;
  public sharedByMe$: Subject<boolean>;
  private _dataMessages: Array<DataMessageImpl>;
  public userGroupAdd$: Subject<UserGroupAdd>;

  constructor() {
    this.behaviourSubjects = new Map<string, BehaviorSubject<CacheUpdateMessage>>();
    Object.keys(CacheEnum).forEach(key => this.behaviourSubjects.set(key, new BehaviorSubject<CacheUpdateMessage>(null)));
    this.webSocket = null;
    this.documentCreated$ = new Subject<KimiosDocument>();
    this.sharedWithMe$ = new Subject<boolean>();
    this.sharedByMe$ = new Subject<boolean>();
    this.userGroupAdd$ = new Subject<UserGroupAdd>();
  }

  public initWebSocket(url: string, wsToken: string): void {
    wsToken = wsToken;
    url = url + wsToken;
    this.webSocket = webSocket(url.replace('http', 'ws'));
    this.webSocket.subscribe(
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
      if (msg['dmEntityList'] != null && msg['parentUid'] != null) {
        const dataMessage = Object.assign(new DataMessageImpl(null, null, null, null), msg);
        this.handleDataMessage(dataMessage);
      }
    }
  }

  private handleUpdateNoticeMsg(updateNoticeMessage: UpdateNoticeMessageImpl): void {
      const messageParsedObj = updateNoticeMessage.message != null ? JSON.parse(updateNoticeMessage.message) : null;

      switch (updateNoticeMessage.updateNoticeType) {
        case UpdateNoticeTypeEnum.KEEPALIVEPING:
          const updateNoticeMessageImpl = new UpdateNoticeMessageImpl(
            UpdateNoticeTypeEnum.KEEPALIVEPONG,
            this.wsToken,
            null,
            null
          );
          this.webSocket.next(updateNoticeMessageImpl);
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
          const obj: UserGroupAdd = {};
          if (messageParsedObj != null ) {
            const o = Object.assign(obj, messageParsedObj);
            this.userGroupAdd$.next(o);
          }
      }
    }

  private handleDataMessage(dataMessage: DataMessageImpl): void {
    this._dataMessages.push(dataMessage);
  }

  get dataMessages(): Array<DataMessageImpl> {
    return this._dataMessages;
  }
}
