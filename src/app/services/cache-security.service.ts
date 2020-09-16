import {Injectable} from '@angular/core';
import {SessionService} from './session.service';
import {combineLatest, Observable, of} from 'rxjs';
import {Document as KimiosDocument, SecurityService} from 'app/kimios-client-api';
import {concatMap, map, tap} from 'rxjs/operators';
import {LockPossibility} from 'app/main/model/lock-possibility';

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
  private _lockPossibilityMap: Map<number, LockPossibility>;

  constructor(
      private sessionService: SessionService,
      private securityService: SecurityService
  ) {
    this._securitiesMap = new Map<number, SecurityEnt>();
    this._lockPossibilityMap = new Map<number, LockPossibility>();
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

  getLockPossibility(doc: KimiosDocument): Observable<LockPossibility> {
    return this._lockPossibilityMap.get(doc.uid) ?
        of(this._lockPossibilityMap.get(doc.uid)) :
        this.computeLockPossibility(doc);
  }

  private computeLockPossibility(doc: KimiosDocument): Observable<LockPossibility> {
    return this.sessionService.getCurrentUserObs().pipe(
        concatMap(currentUser => combineLatest(of(currentUser), this.getSecurityEnt(doc.uid))),
        map(([currentUser, secEnt]) => {
          let lockPossibility: LockPossibility = null;
          if (doc.checkedOut) {
            // checked out by current user
            if (secEnt.write
                && doc.checkoutUser === currentUser.uid
                && doc.checkoutUserSource === currentUser.source) {
              lockPossibility = LockPossibility.CAN_UNLOCK;
            } else {
              lockPossibility = LockPossibility.CANNOT_UNLOCK;
            }
          } else {
            if (secEnt.write) {
              lockPossibility = LockPossibility.CAN_LOCK;
            } else {
              lockPossibility = LockPossibility.CANNOT_LOCK;
            }
          }
          this._lockPossibilityMap.set(doc.uid, lockPossibility);
          return lockPossibility;
        })
    );
  }
}
