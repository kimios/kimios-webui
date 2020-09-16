import {Injectable} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {combineLatest, Observable, of} from 'rxjs';
import {SecurityService} from 'app/kimios-client-api';
import {concatMap, tap} from 'rxjs/operators';
import {LockPossibility} from 'app/main/model/lock-possibility';
import {BrowseEntityService} from 'app/services/browse-entity.service';

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
      private securityService: SecurityService,
      private browseEntityService: BrowseEntityService
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

  getLockPossibility(docId: number): Observable<LockPossibility> {
    return this._lockPossibilityMap.get(docId) ?
        of(this._lockPossibilityMap.get(docId)) :
        this.computeLockPossibility(docId);
  }

  private computeLockPossibility(docId: number): Observable<LockPossibility> {
    return this.sessionService.getCurrentUserObs().pipe(
        concatMap(currentUser => combineLatest(of(currentUser), this.browseEntityService.getDocument(docId))),
        concatMap(([currentUser, doc]) => combineLatest(of(currentUser), of(doc), this.getSecurityEnt(doc.uid))),
        concatMap(([currentUser, doc, secEnt]) => {
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
          return of(lockPossibility);
        })
    );
  }

  invalidSecurityEntry(entityId: number): void {
    this._securitiesMap.delete(entityId);
  }

  invalidLockEntry(entityId: number): void {
    this._lockPossibilityMap.delete(entityId);
    this.browseEntityService.deleteCacheDocumentEntry(entityId);
  }
}
