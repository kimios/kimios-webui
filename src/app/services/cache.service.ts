import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CacheUpdateMessage} from 'app/main/model/cache-update-message';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {webSocket} from 'rxjs/webSocket';
import {UpdateNoticeMessageImpl} from 'app/main/model/update-notice-message-impl';
import {UpdateNoticeMessage} from 'app/kimios-client-api/model/updateNoticeMessage';
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
  private webSocket: WebSocketSubject<any>;
  private wsToken: string;

  constructor() {
    this.behaviourSubjects = new Map<string, BehaviorSubject<CacheUpdateMessage>>();
    Object.keys(CacheEnum).forEach(key => this.behaviourSubjects.set(key, new BehaviorSubject<CacheUpdateMessage>(null)));

    this.webSocket = null;
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
      if (updateNoticeMessage.updateNoticeType === UpdateNoticeTypeEnum.KEEPALIVEPING) {
        const updateNoticeMessageImpl = new UpdateNoticeMessageImpl(
          UpdateNoticeTypeEnum.KEEPALIVEPONG,
          this.wsToken,
          null,
          null
        );
        this.webSocket.next(updateNoticeMessageImpl);
      }
    }
  }
}
