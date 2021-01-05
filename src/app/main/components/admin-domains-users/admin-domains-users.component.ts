import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AdminService} from 'app/services/admin.service';
import {BehaviorSubject, of} from 'rxjs';
import {User as KimiosUser} from 'app/kimios-client-api/model/user';
import {SecurityService} from 'app/kimios-client-api';
import {catchError, concatMap, filter, share, switchMap, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'admin-domains-users',
  templateUrl: './admin-domains-users.component.html',
  styleUrls: ['./admin-domains-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDomainsUsersComponent implements OnInit {

  users$: BehaviorSubject<Array<KimiosUser>>;

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService
  ) {
    this.users$ = new BehaviorSubject<Array<KimiosUser>>(new Array<KimiosUser>());
  }

  ngOnInit(): void {
    this.adminService.selectedDomain$.pipe(
        tap(() => console.log('AdminDomainsUsersComponent')),
        filter(domainName => domainName !== ''),
        concatMap(domainName => this.securityService.getUsers(this.sessionService.sessionToken, domainName).pipe(
            catchError(err => of(new Array<KimiosUser>())),
            share()
        )),
        tap(users => this.users$.next(users))
    ).subscribe();
  }

}
