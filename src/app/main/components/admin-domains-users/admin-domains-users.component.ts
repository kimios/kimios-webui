import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AdminService} from 'app/services/admin.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {User as KimiosUser} from 'app/kimios-client-api/model/user';
import {SecurityService} from 'app/kimios-client-api';
import {catchError, concatMap, filter, map, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {USERS_DEFAULT_DISPLAYED_COLUMNS, UsersDataSource} from './users-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';

@Component({
  selector: 'admin-domains-users',
  templateUrl: './admin-domains-users.component.html',
  styleUrls: ['./admin-domains-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDomainsUsersComponent implements OnInit {

  users$: BehaviorSubject<Array<KimiosUser>>;
  dataSource: UsersDataSource;
  columnsDescription = USERS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [ 'uid', 'lastName', 'firstName' ];

  sort: DMEntitySort = { name: 'name', direction: 'asc' };

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService,
  ) {
    this.users$ = new BehaviorSubject<Array<KimiosUser>>(new Array<KimiosUser>());
  }

  ngOnInit(): void {
    this.dataSource = new UsersDataSource(this.sessionService, this.securityService);

    this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== '')
    ).subscribe(
        domainName => this.dataSource.loadUsers(domainName)
    );

    this.users$.subscribe(users => console.dir(users));
  }

  loadUsers(source: string, usersFilter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 20):
      Observable<Array<KimiosUser>> {
    return this.securityService.getUsers(this.sessionService.sessionToken, source).pipe(
        catchError(() => of(new Array<KimiosUser>())),
        tap(users => console.log('returned ' + users.length + ' users')),
        map(users => users),
    );
  }

  sortData($event: Sort): void {

  }
}
