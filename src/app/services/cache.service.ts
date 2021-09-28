import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CacheUpdateMessage} from 'app/main/model/cache-update-message';
import {environment} from '../../environments/environment';
import {SessionService} from './session.service';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {webSocket} from 'rxjs/webSocket';

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

  constructor() {
    this.behaviourSubjects = new Map<string, BehaviorSubject<CacheUpdateMessage>>();
    Object.keys(CacheEnum).forEach(key => this.behaviourSubjects.set(key, new BehaviorSubject<CacheUpdateMessage>(null)));

    this.webSocket = null;
  }

  public initWebSocket(url: string): void {
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
    if (msg.constructor === 'Message') {
      console.log('Websocket received message: ');
      console.dir(msg);
    }
  }
}
