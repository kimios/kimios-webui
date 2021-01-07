import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {AdminService} from 'app/services/admin.service';
import {Observable, of} from 'rxjs';
import {User as KimiosUser} from 'app/kimios-client-api/model/user';
import {SecurityService} from 'app/kimios-client-api';
import {catchError, filter, map, startWith, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {USERS_DEFAULT_DISPLAYED_COLUMNS, UsersDataSource} from './users-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {MatAutocompleteTrigger, Sort} from '@angular/material';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'admin-domains-users',
  templateUrl: './admin-domains-users.component.html',
  styleUrls: ['./admin-domains-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDomainsUsersComponent implements OnInit {

  dataSource: UsersDataSource;
  columnsDescription = USERS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [ 'uid', 'lastName', 'firstName' ];

  sort: DMEntitySort = { name: 'name', direction: 'asc' };
  userSearch = new FormControl('');
  filteredUsers$: Observable<Array<KimiosUser>>;

  @ViewChild('inputUserSearch', { read: MatAutocompleteTrigger }) inputUserSearch: MatAutocompleteTrigger;

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService,
  ) {
    this.filteredUsers$ = new Observable<Array<KimiosUser>>();
  }

  ngOnInit(): void {
    this.dataSource = new UsersDataSource(this.sessionService, this.securityService);

    this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== ''),
    ).subscribe(
        domainName => this.dataSource.loadUsers(domainName)
    );

    this.filteredUsers$ = this.userSearch.valueChanges.pipe(
        startWith(''),
        filter(value => value !== ''),
        map(value => this.dataSource.filterUsers(value))
    );
  }

  displayFn(user?: KimiosUser): string {
    return this.userSearch ? this.userSearch.value : '';
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

  filterUsers(): void {
    this.dataSource.loadUsers(this.adminService.selectedDomain$.getValue(), this.userSearch.value);
    this.inputUserSearch.closePanel();
  }

  showUser(user: KimiosUser): void {

  }
}
