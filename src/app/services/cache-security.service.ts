import { Injectable } from '@angular/core';
import {SessionService} from './session.service';
import {combineLatest, Observable, of} from 'rxjs';
import {SecurityService} from '../kimios-client-api';
import {concatMap, tap} from 'rxjs/operators';

export interface SecurityEnt {
  read: boolean;
  write: boolean;
  fullAccess: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CacheSecurityService {

  private _securitiesMap: Map<number, SecurityEnt>;

  constructor(
      private sessionService: SessionService,
      private securityService: SecurityService
  ) {
    this._securitiesMap = new Map<number, SecurityEnt>();
  }

  addSecurityEnt(uid: number, sec: SecurityEnt): void {
    this._securitiesMap.set(uid, sec);
  }

  getSecurityEnt(uid: number): Observable<SecurityEnt> {
    return this._securitiesMap.get(uid) ?
        of(this._securitiesMap.get(uid)) :
        this.loadSecurityEnt(uid);
  }

  loadSecurityEnt(uid: number): Observable<SecurityEnt> {
    return this.securityService.canRead(this.sessionService.sessionToken, uid).pipe(
        concatMap(next => combineLatest(
            of({read: next, write: null, fullaccess: null}), this.securityService.canWrite(this.sessionService.sessionToken, uid)
        )),
        concatMap(([secEnt, write]) => combineLatest(
            of({ read: secEnt.read, write: write, fullAccess: null }),
            this.securityService.hasFullAccess(this.sessionService.sessionToken, uid)
        )),
        concatMap(([secEnt, fullAccess]) => of({read: secEnt.read, write: secEnt.write, fullAccess: fullAccess})),
        tap(secEnt => this.addSecurityEnt(uid, secEnt))
    );
  }
}
