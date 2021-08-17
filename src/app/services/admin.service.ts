import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, from, iif, Observable, of, Subject, zip} from 'rxjs';
import {AdministrationService, AuthenticationSource, Role, SecurityService, User as KimiosUser} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {catchError, concatMap, map, switchMap, tap, toArray} from 'rxjs/operators';
import {SPECIAL_ROLES} from 'app/main/model/special-roles.enum';

export interface GroupIdSource {
    gid: string;
    source: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomain$: BehaviorSubject<string>;
  selectedRole$: BehaviorSubject<number>;
  selectedTask$: BehaviorSubject<number>;
  selectedUser$: BehaviorSubject<KimiosUser>;
  groupCreated$: BehaviorSubject<boolean>;
  groupModified$: BehaviorSubject<GroupIdSource>;
  selectedDocumentType$: BehaviorSubject<number>;
  newDocumentType$: BehaviorSubject<boolean>;
  needRefreshDocumentTypes$: BehaviorSubject<boolean>;

  closeUserDialog$: Subject<boolean>;

  constructor(
      private sessionService: SessionService,
      private securityService: SecurityService,
      private administrationService: AdministrationService
  ) {
    this.domains$ = this.securityService.getAuthenticationSources();
    this.selectedDomain$ = new BehaviorSubject<string>('');
    this.selectedRole$ = new BehaviorSubject<number>(0);
    this.selectedTask$ = new BehaviorSubject<number>(0);
    this.selectedUser$ = new BehaviorSubject<KimiosUser>(null);
    this.closeUserDialog$ = new Subject<boolean>();
    this.groupCreated$ = new BehaviorSubject<boolean>(false);
    this.selectedDocumentType$ = new BehaviorSubject<number>(0);
    this.groupModified$ = new BehaviorSubject<GroupIdSource>(null);
    this.newDocumentType$ = new BehaviorSubject<boolean>(null);
    this.needRefreshDocumentTypes$ = new BehaviorSubject<boolean>(null);
  }

    saveUserGroups(userId: string, mapGroups: Map<string, boolean>): Observable<boolean> {

        return zip(from(mapGroups.keys()).pipe(
            switchMap(gid => {
                if (mapGroups.get(gid) === true) {
                    return combineLatest(of(gid), this.administrationService.addUserToGroup(this.sessionService.sessionToken, userId, gid, this.selectedDomain$.getValue()));
                } else {
                    return combineLatest(of(gid), this.administrationService.removeUserFromGroup(this.sessionService.sessionToken, userId, gid, this.selectedDomain$.getValue()));
                }
            }),
            tap(([gid, res]) => this.groupModified$.next(
                <GroupIdSource>{
                    gid: gid,
                    source: this.selectedDomain$.getValue()
                })),
            map(([gid, res]) => res),
            catchError(() => of(false)),
            concatMap(res => iif(() => typeof res === 'boolean', of(false), of(true))),
        )
      ).pipe(
          map(array => {
            if (array.filter(val => val === false).length > 0) {
              return false;
            } else {
                return true;
            }
          }),
      );
    }

    findUsersWithRole(roleId: number): Observable<Array<Role>> {
        return this.administrationService.getRoles(this.sessionService.sessionToken, roleId);
    }

    loadUsersFromUsersRole(roles: Array<Role>): Observable<Array<KimiosUser>> {
        return from(roles).pipe(
            concatMap(role => this.administrationService.getManageableUser(
                this.sessionService.sessionToken,
                role.userName,
                role.userSource
            )),
            toArray(),
        );
    }

    isWorkspaceCreator(): Observable<boolean> {
        return this.findUsersWithRole(SPECIAL_ROLES.WORKSPACE_CREATOR).pipe(
            map(roles => roles.filter(role =>
                role.userName === this.sessionService.currentUser.uid
            && role.userSource === this.sessionService.currentUser.source).length > 0
        ));
    }
}
