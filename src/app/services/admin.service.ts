import {Injectable} from '@angular/core';
import {BehaviorSubject, from, iif, Observable, of, Subject, zip} from 'rxjs';
import {AdministrationService, AuthenticationSource, SecurityService} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {catchError, concatMap, map, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomain$: BehaviorSubject<string>;

  closeUserDialog$: Subject<boolean>;

  constructor(
      private sessionService: SessionService,
      private securityService: SecurityService,
      private administrationService: AdministrationService
  ) {
    this.domains$ = this.securityService.getAuthenticationSources();
    this.selectedDomain$ = new BehaviorSubject<string>('');
    this.closeUserDialog$ = new Subject<boolean>();
  }

    saveUserGroups(userId: string, mapGroups: Map<string, boolean>): Observable<boolean> {

        return zip(from(mapGroups.keys()).pipe(
            switchMap(gid => {
                if (mapGroups.get(gid) === true) {
                    return this.administrationService.addUserToGroup(this.sessionService.sessionToken, userId, gid, this.selectedDomain$.getValue());
                } else {
                    return this.administrationService.removeUserFromGroup(this.sessionService.sessionToken, userId, gid, this.selectedDomain$.getValue());
                }
            }),
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
          })
      );
    }
}
