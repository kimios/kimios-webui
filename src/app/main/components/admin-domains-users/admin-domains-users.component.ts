import {ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {AdminService} from 'app/services/admin.service';
import {Observable, of} from 'rxjs';
import {User as KimiosUser} from 'app/kimios-client-api/model/user';
import {SecurityService} from 'app/kimios-client-api';
import {catchError, filter, map, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {USERS_DEFAULT_DISPLAYED_COLUMNS, UsersDataSource} from './users-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {MatAutocompleteTrigger, MatDialog, MatDialogRef, PageEvent, Sort} from '@angular/material';
import {FormControl} from '@angular/forms';
import {UserDialogComponent} from 'app/main/components/user-dialog/user-dialog.component';

@Component({
  selector: 'admin-domains-users',
  templateUrl: './admin-domains-users.component.html',
  styleUrls: ['./admin-domains-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDomainsUsersComponent implements OnInit {

  @Input()
  _mode: 'admin' | 'roles' = 'admin';

  dataSource: UsersDataSource;
  columnsDescription = USERS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [ 'uid', 'lastName', 'firstName' ];

  sort: DMEntitySort = { name: 'lastName', direction: 'asc' };
  userSearch = new FormControl('');
  filteredUsers$: Observable<Array<KimiosUser>>;

  page = 0;
  pageSize = 10;
  pageOptions = [ 10, 20 ];

  @ViewChild('inputUserSearch', { read: MatAutocompleteTrigger }) inputUserSearch: MatAutocompleteTrigger;
  totalNbElements: number;

  dialogRef: MatDialogRef<UserDialogComponent, any>;

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      public dialog: MatDialog
  ) {
    this.filteredUsers$ = new Observable<Array<KimiosUser>>();
  }

  ngOnInit(): void {
    this.dataSource = new UsersDataSource(this.sessionService, this.securityService, this.adminService);

    if (this.modeIsAdmin()) {
      this.adminService.selectedDomain$.pipe(
          filter(domainName => domainName !== '')
      ).subscribe(
          domainName => this.dataSource.loadUsers(domainName, this.sort, this.userSearch.value, this.page, this.pageSize)
      );

      this.filteredUsers$ = this.userSearch.valueChanges.pipe(
          map(value => this.dataSource.filterUsers(value, this.adminService.selectedDomain$.getValue()))
      );

      this.adminService.closeUserDialog$.subscribe(boolean => {
        if (boolean && this.dialogRef != null) {
          this.dialogRef.close();
        }
      });
    }

    this.dataSource.totalNbElements$.subscribe(
        total => this.totalNbElements = total
    );

    if (this._mode === 'roles') {
      this.displayedColumns = [ 'uid', 'lastName', 'firstName' ];
      this.adminService.selectedRole$.pipe(
          filter(roleId => roleId !== 0),
      ).subscribe(
          roleId => this.dataSource.loadUsersForRoleId(roleId, this.sort)
      );
    }
  }

  private modeIsAdmin(): boolean {
    return this._mode === 'admin';
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
    this.sort.name = $event.active;
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    if (this.modeIsAdmin()) {
      this.dataSource.loadUsers(
          this.adminService.selectedDomain$.getValue(),
          this.sort,
          this.userSearch.value,
          this.page,
          this.pageSize
      );
    } else {
      this.dataSource.sortLoadedData(this.sort);
    }
  }

  filterUsers(): void {
    this.dataSource.loadUsers(this.adminService.selectedDomain$.getValue(), this.sort, this.userSearch.value, this.page, this.pageSize);
    this.inputUserSearch.closePanel();
  }

  showUser(user: KimiosUser): void {
    this.dialogRef = this.dialog.open(UserDialogComponent, {
      data: {
        'user': user,
        'edit': this.modeIsAdmin()
      },
    });
  }

  handlePageEvent($event: PageEvent): void {
    this.page = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this._updatePage();
  }

  _updatePage(): void {
    this.dataSource.loadUsers(this.adminService.selectedDomain$.getValue(), this.sort,
        this.userSearch.value, this.page, this.pageSize);
  }

  openNewUserDialog(): void {
    this.dialogRef = this.dialog.open(UserDialogComponent, {
      data: {
        'source': this.adminService.selectedDomain$.getValue()
      },
    });
  }
}
