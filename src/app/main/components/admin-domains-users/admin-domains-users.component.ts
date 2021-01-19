import {ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {AdminService} from 'app/services/admin.service';
import {from, Observable, of} from 'rxjs';
import {User as KimiosUser} from 'app/kimios-client-api/model/user';
import {AdministrationService, AuthenticationSource, SecurityService} from 'app/kimios-client-api';
import {catchError, concatMap, filter, map, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {USERS_DEFAULT_DISPLAYED_COLUMNS, UsersDataSource} from './users-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {MatAutocompleteTrigger, MatDialog, MatDialogRef, PageEvent, Sort} from '@angular/material';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {UserDialogComponent} from 'app/main/components/user-dialog/user-dialog.component';
import {AdminSpecialRolesAddToRoleDialogComponent} from 'app/main/components/admin-special-roles-add-to-role-dialog/admin-special-roles-add-to-role-dialog.component';

@Component({
  selector: 'admin-domains-users',
  templateUrl: './admin-domains-users.component.html',
  styleUrls: ['./admin-domains-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDomainsUsersComponent implements OnInit {

  @Input()
  _mode: 'admin' | 'roles' | 'addToRole' = 'admin';

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

  dialogRef: MatDialogRef<UserDialogComponent, any> | MatDialogRef<AdminSpecialRolesAddToRoleDialogComponent>;

  selectDomain: FormControl;
  domains$: Observable<Array<AuthenticationSource>>;
  usersToAddToRole: FormGroup;
  showSpinnerFormSubmit = false;
  nbUsersToAdd = 0;

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      public dialog: MatDialog,
      private fb: FormBuilder
  ) {
    this.filteredUsers$ = new Observable<Array<KimiosUser>>();
    this.usersToAddToRole = this.fb.group({});
    this.selectDomain = this.fb.control('');
  }

  ngOnInit(): void {
    this.dataSource = new UsersDataSource(this.sessionService, this.securityService, this.adminService);

    if (this.modeIsAdmin()
        || this._mode === 'addToRole') {
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
      this.displayedColumns = [ 'remove', 'uid', 'lastName', 'firstName' ];
      this.adminService.selectedRole$.pipe(
          filter(roleId => roleId !== 0),
      ).subscribe(
          roleId => this.dataSource.loadUsersForRoleId(roleId, this.sort)
      );
    }

    if (this._mode === 'addToRole') {
      this.displayedColumns = [ 'checkbox', 'uid', 'lastName', 'firstName' ];
      this.domains$ = this.securityService.getAuthenticationSources();

      this.selectDomain.valueChanges.pipe(
          map(domain => { if (typeof domain === 'string') {
            this.dataSource.loadUsers(domain, this.sort, this.userSearch.value, this.page, this.pageSize);
          }})
      ).subscribe();
      this.dataSource.connect().pipe(
          map(users => users.forEach(user => this.usersToAddToRole.addControl(user.uid, this.fb.control(false))))
      ).subscribe();

      this.domains$.pipe(
          filter(() => this.selectDomain.value === ''),
          filter(domains => domains.length > 0)
      ).subscribe(
          domains => {
            this.adminService.selectedDomain$.next(domains[0].name);
            this.selectDomain.setValue(domains[0].name);
          }
      );

      this.usersToAddToRole.valueChanges.subscribe(
          () => this.nbUsersToAdd = Object.keys(this.usersToAddToRole.controls).filter(controlKey =>
              this.usersToAddToRole.get(controlKey).value === true
          ).length
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
    if (this._mode === 'admin'
        || this._mode === 'addToRole') {
      this.dataSource.loadUsers(this.adminService.selectedDomain$.getValue(), this.sort, this.userSearch.value, this.page, this.pageSize);
      this.inputUserSearch.closePanel();
    }
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

  openAddToRoleDialog(): void {
    this.dialogRef = this.dialog.open(AdminSpecialRolesAddToRoleDialogComponent);
  }

  openDialog(): void {
    if (this._mode === 'roles') {
      this.openAddToRoleDialog();
    } else {
      this.openNewUserDialog();
    }
  }

  removeUserFromRole(row: KimiosUser): void {
    this.administrationService.deleteRole(
        this.sessionService.sessionToken,
        this.adminService.selectedRole$.getValue(),
        row.uid,
        row.source
    ).subscribe(
        () => this.dataSource.loadUsersForRoleId(this.adminService.selectedRole$.getValue(), this.sort)
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmitAddUsers(): void {
    from(Object.keys(this.usersToAddToRole.controls)).pipe(
        filter(key => key !== '' && this.usersToAddToRole.get(key).value === true),
        concatMap(key => this.administrationService.createRole(
            this.sessionService.sessionToken,
            this.adminService.selectedRole$.getValue(),
            key,
            this.adminService.selectedDomain$.getValue()
        ))
    ).subscribe();
  }
}
