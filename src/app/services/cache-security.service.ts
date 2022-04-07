import {Injectable} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {combineLatest, Observable, of} from 'rxjs';
import {AuthenticationSource, Group, SecurityService} from 'app/kimios-client-api';
import {concatMap, map, tap, toArray} from 'rxjs/operators';
import {LockPossibility} from 'app/main/model/lock-possibility';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {Document as KimiosDocument} from 'app/kimios-client-api/model/document';
import {User} from 'app/kimios-client-api/model/user';
import {EntityCacheService} from './entity-cache.service';
import {UsersCacheService} from './users-cache.service';
import {DMEntityWrapper} from '../kimios-client-api/model/dMEntityWrapper';

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
      private browseEntityService: BrowseEntityService,
      private entityCacheService: EntityCacheService,
      private usersCacheService: UsersCacheService
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
        this.loadSecurityFromCache(uid);
  }

  loadSecurityFromCache(uid: number): Observable<SecurityEnt> {
    return this.entityCacheService.findEntityWrapperInCache(uid).pipe(
      concatMap(entityWrapper => entityWrapper != null ?
        of(<SecurityEnt>{
          read: entityWrapper.canRead,
          write: entityWrapper.canWrite,
          fullAccess: entityWrapper.hasFullAccess
        }) :
        this.loadSecurityEnt(uid)
      ),
      tap(secEnt => this.addSecurityEnt(uid, secEnt))
    );
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
        concatMap(([secEnt, fullAccess]) => of({read: secEnt.read, write: secEnt.write, fullAccess: fullAccess}))
    );
  }

  getLockPossibility(docId: number): Observable<LockPossibility> {
    return this._lockPossibilityMap.get(docId) ?
        of(this._lockPossibilityMap.get(docId)) :
        this.computeLockPossibility(docId);
  }

  private computeLockPossibility(docId: number): Observable<LockPossibility> {
    return this.sessionService.getCurrentUserObs().pipe(
        concatMap(currentUser => combineLatest(of(currentUser), this.entityCacheService.findDocumentInCache(docId))),
        concatMap(([currentUser, docWrapper]) =>
          combineLatest(
            of(currentUser),
            of((docWrapper as DMEntityWrapper).dmEntity as KimiosDocument),
            this.getSecurityEnt(docWrapper.dmEntity.uid))
        ),
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
    this.entityCacheService.reloadEntity(entityId);
  }

  public retrieveUsersAndGroups(searchTerm: string): Observable<Array<UserOrGroup>> {

    return this.securityService.getAuthenticationSources().pipe(
        concatMap(sources => sources),
        concatMap(source => combineLatest(
            this.usersCacheService.findUsersInCache(source.name).pipe(
                map(users => this.filterUsers(users, searchTerm)),
                concatMap(users => of(this.toUserOrGroupArrayWithType('user', users)))
            ),
            this.usersCacheService.findGroupsInCache(source.name).pipe(
                map(groups => this.filterGroups(groups, searchTerm)),
                concatMap(groups => of(this.toUserOrGroupArrayWithType('group', groups)))
            )
        )),
        map(([u, g]) => u.concat(g))
    );
  }

  public retrieveUsersWithSearchTerm(searchTerm: string): Observable<Array<User>> {

    return this.securityService.getAuthenticationSources().pipe(
      concatMap(sources => sources),
      concatMap(source => this.usersCacheService.findUsersInCache(source.name)),
      toArray(),
      map(arrayOfUsersArray => {
        let users = new Array<User>();
        arrayOfUsersArray.forEach(usersArray => users = users.concat(usersArray));
        return users;
      }),
      map(users => this.filterUsers(users, searchTerm))
    );
  }
  
  private filterUsers(users: Array<User>, searchTerm: string): Array<User> {
    searchTerm = searchTerm.toLowerCase();
    return users.filter(user => user.uid.includes(searchTerm)
        || user.name.toLowerCase().includes(searchTerm)
        || user.firstName.toLowerCase().includes(searchTerm)
        || user.lastName.toLowerCase().includes(searchTerm)
    );
  }

  private filterGroups(groups: Array<Group>, searchTerm: string): Array<User> {
    return groups.filter(group => group.gid.includes(searchTerm)
        || group.name.includes(searchTerm)
    );
  }

  retrieveUsers(source: AuthenticationSource): Observable<Array<User>> {
    return this.usersCacheService.findUsersInCache(source.name);
  }


  toUserOrGroupArrayWithType(type: 'user' | 'group', array: Array<User>): Array<UserOrGroup> {
    return array.map(user => {
      return this.toUserOrGroupWithType(type, user);
    });
  }

  toUserOrGroupWithType(type: 'user' | 'group', elem: User | Group): UserOrGroup {
    const userOrGroup: UserOrGroup = {type: type, element: elem};
    return userOrGroup;
  }
}
