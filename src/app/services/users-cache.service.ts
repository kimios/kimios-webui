import {Injectable} from '@angular/core';
import {SessionService} from './session.service';
import {AdministrationService, Group, SecurityService, User as KimiosUser} from 'app/kimios-client-api';
import {Observable, of, Subject} from 'rxjs';
import {catchError, concatMap, switchMap, tap} from 'rxjs/operators';
import {UpdateNoticeParameters} from 'app/main/model/cache/event/update-notice-parameters';

@Injectable({
  providedIn: 'root'
})
export class UsersCacheService {

  // users by domain and group
  groupUsersCache: Map<string, Map<string, Array<string>>>;
  userCache: Map<string, Map<string, KimiosUser>>;
  groupCache: Map<string, Map<string, Group>>;

  userAddedToGroup$: Subject<UpdateNoticeParameters>;
  userRemovedFromGroup$: Subject<UpdateNoticeParameters>;
  userCreated$: Subject<UpdateNoticeParameters>;
  userRemoved$: Subject<UpdateNoticeParameters>;
  userUpdated$: Subject<UpdateNoticeParameters>;
  groupCreated$: Subject<UpdateNoticeParameters>;
  groupRemoved: Subject<UpdateNoticeParameters>;
  groupUpdated$: Subject<UpdateNoticeParameters>;

  constructor(
    private sessionService: SessionService,
    private administrationService: AdministrationService,
    private securityService: SecurityService
  ) {
    this.userCache = new Map<string, Map<string, KimiosUser>>();
    this.groupCache = new Map<string, Map<string, Group>>();
    this.groupUsersCache = new Map<string, Map<string, Array<string>>>();
    this.userAddedToGroup$ = new Subject<UpdateNoticeParameters>();
    this.userRemovedFromGroup$ = new Subject<UpdateNoticeParameters>();
    this.userCreated$ = new Subject<UpdateNoticeParameters>();
    this.userRemoved$ = new Subject<UpdateNoticeParameters>();
    this.userUpdated$ = new Subject<UpdateNoticeParameters>();
    this.groupCreated$ = new Subject<UpdateNoticeParameters>();
    this.groupRemoved = new Subject<UpdateNoticeParameters>();
    this.groupUpdated$ = new Subject<UpdateNoticeParameters>();
  }

  findUserInCache(uid: string, source: string): Observable<KimiosUser> {
    const userInCache = this.userCache.get(source) == null ?
      null :
      this.userCache.get(source).get(uid);

    return userInCache == null || userInCache === undefined ?
      this.administrationService.getManageableUser(this.sessionService.sessionToken, uid, source).pipe(
        tap(user => this.initUserInCache(user))
      ) :
      of(userInCache);
  }

  findUsersInCache(source: string): Observable<Array<KimiosUser>> {
    const usersInCache = this.userCache.get(source) == null ?
      null :
      Array.from(this.userCache.get(source).values());

    return usersInCache == null || usersInCache === undefined ?
      this.securityService.getUsers(this.sessionService.sessionToken, source).pipe(
        switchMap(
          res => of(res).catch(error => of(error))
        ),
        catchError(error => {
          console.log('findUsersInCache(' + source + '): ');
          console.dir(error);
          return of([]);
        }),
        tap(users => {
          this.userCache.set(source, new Map<string, KimiosUser>());
          users.forEach(user => this.userCache.get(source).set(user.uid, user));
        })
      ) :
      of(usersInCache);
  }

  private initUserInCache(user: KimiosUser): void {
    if (this.userCache.get(user.source) == null) {
      this.userCache.set(user.source, new Map<string, KimiosUser>());
    }
    this.userCache.get(user.source).set(user.uid, user);
  }

  findGroupInCache(source: string, gid: string): Observable<Group> {
    const groupInCache = this.groupCache.get(source) == null ?
      null :
      this.groupCache.get(source).get(gid);

    return groupInCache == null || groupInCache === undefined ?
      this.administrationService.getManageableGroup(this.sessionService.sessionToken, gid, source).pipe(
        tap(group => this.initGroupInCache(group))
      ) :
      of(groupInCache);
  }

  findGroupsInCache(source: string): Observable<Array<Group>> {
    const groupsInCache = this.groupCache.get(source) == null ?
      null :
      this.groupCache.get(source).values();

    return groupsInCache == null || groupsInCache === undefined ?
      this.securityService.getGroups(this.sessionService.sessionToken, source).pipe(
        switchMap(
          res => of(res).catch(error => of(error))
        ),
        catchError(error => {
          console.log('findGroupsInCache(' + source + '): ');
          console.dir(error);
          return of([]);
        }),
        tap(groups => groups.forEach(grp => this.initGroupInCache(grp)))
      ) :
      of(Array.from(groupsInCache));
  }

  private initGroupInCache(group: Group): void {
    if (this.groupCache.get(group.source) == null) {
      this.groupCache.set(group.source, new Map<string, Group>());
    }
    this.groupCache.get(group.source).set(group.gid, group);
  }

  findGroupUsersInCache(gid: string, source: string): Observable<Array<KimiosUser>> {
    const groupUsersInCache = this.groupUsersCache.get(source) == null ?
      null :
      this.groupUsersCache.get(source).get(gid);

    return groupUsersInCache == null || groupUsersInCache === undefined ?
      this.administrationService.getManageableUsers(this.sessionService.sessionToken, gid, source).pipe(
        tap(users => this.initGroupUsersInCache(source, gid, users))
      ) :
      of (groupUsersInCache.map(userId => this.userCache.get(source).get(userId)));
  }

  private initGroupUsersInCache(source: string, gid: string, users: Array<KimiosUser>): void {
    if (this.groupUsersCache.get(source) == null) {
      this.groupUsersCache.set(source, new Map<string, Array<string>>());
    }
    this.groupUsersCache.get(source).set(gid, users.map(user => user.uid));

    // init users in cache if needed
    users.forEach(user => {
      if (! this.userIsInCache(user)) {
        this.initUserInCache(user);
      }
    });
  }

  private userIsInCache(user: KimiosUser): boolean {
    if (user == null) {
      return ;
    }
    return this.userUidIsInCache(user.uid, user.source);
  }

  private userUidIsInCache(userUid: string, source: string): boolean {
    return this.userCache.get(source) != null
      && this.userCache.get(source).get(userUid) != null;
  }

  removeUserInCache(user: KimiosUser): Observable<boolean> {
    if (user == null) {
      return ;
    }
    return this.removeUserUidInCache(user.uid, user.source);
  }

  removeUserUidInCache(userUid: string, source: string): Observable<boolean> {
    if (!this.userUidIsInCache(userUid, source)) {
      return of(false);
    }
    this.groupUsersCache.get(source).forEach((users) => {
      const idx = users.findIndex(uid => uid === userUid);
      if (idx !== -1) {
        users.splice(idx, 1);
      }
    });
    this.userCache.get(source).delete(userUid);
    return of(true);
  }

  removeGroupUserInCache(gid: string, user: KimiosUser): Observable<boolean> {
    const domainGroups = this.groupUsersCache.get(user.source);
    if (domainGroups == null) {
      return of(false);
    }
    const groupUsers = domainGroups.get(gid);
    if (groupUsers == null) {
      return of(false);
    }
    const idx = groupUsers.findIndex(u => u === user.uid);
    if (idx === -1) {
      return of(false);
    }
    groupUsers.splice(idx, 1);
    return of(true);
  }

  updateUserInCache(source: string, userUid: string): Observable<KimiosUser> {
    return this.removeUserUidInCache(userUid, source).pipe(
      concatMap(() => this.findUserInCache(userUid, source))
    );
  }

  handleUserGroupAdd(obj: UpdateNoticeParameters): void {
    const sourceGroups = this.groupUsersCache.get(obj.source);
    if (sourceGroups == null) {
      this.initGroupUsersInCache(obj.source, obj.group, []);
    }
    const groupUsers = this.groupUsersCache.get(obj.source).get(obj.group);
    if (groupUsers == null) {
      this.initGroupUsersInCache(obj.source, obj.group, []);
    }
    this.groupUsersCache.get(obj.source).get(obj.group).push(obj.user);
    this.userAddedToGroup$.next(obj);
  }

  handleUserGroupRemove(obj: UpdateNoticeParameters): void {
    const sourceGroups = this.groupUsersCache.get(obj.source);
    if (sourceGroups == null) {
      return;
    }
    const groupUsers = this.groupUsersCache.get(obj.source).get(obj.group);
    if (groupUsers == null) {
      return;
    }
    const idx = groupUsers.findIndex(user => user === obj.user);
    if (idx !== -1) {
      this.groupUsersCache.get(obj.source).get(obj.group).splice(idx, 1);
    }
    this.userRemovedFromGroup$.next(obj);
  }

  handleUserCreated(parameters: UpdateNoticeParameters): void {
    this.findUserInCache(parameters.user, parameters.source).pipe(
      tap(next => this.userCreated$.next(parameters))
    ).subscribe();
  }

  handleUserRemoved(parameters: UpdateNoticeParameters): void {
    this.removeUserUidInCache(parameters.user, parameters.source).pipe(
      tap(next => this.userRemoved$.next(parameters))
    ).subscribe();
  }

  handleUserUpdated(parameters: UpdateNoticeParameters): void {
    this.updateUserInCache(parameters.source, parameters.user).pipe(
      tap(next => this.userUpdated$.next(parameters))
    ).subscribe();
  }
}
