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
import {UsersCacheService} from 'app/services/users-cache.service';

@Component({
  selector: 'admin-domains-users',
  templateUrl: './admin-domains-users.component.html',
  styleUrls: ['./admin-domains-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDomainsUsersComponent implements OnInit {

  @Input()
  _mode: 'admin' | 'roles' | 'addToRole' | 'groupUsers' = 'admin';

  @Input()
  groupGid: string;

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
  currentUserIsAdmin$: Observable<boolean>;
  usersLoaded$: Observable<Array<KimiosUser>>;

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      public dialog: MatDialog,
      private fb: FormBuilder,
      private usersCacheService: UsersCacheService
  ) {
    this.filteredUsers$ = new Observable<Array<KimiosUser>>();
    this.usersToAddToRole = this.fb.group({});
    this.selectDomain = this.fb.control('');
    this.currentUserIsAdmin$ = new Observable<boolean>();
  }

  ngOnInit(): void {
    this.dataSource = new UsersDataSource(this.sessionService, this.securityService, this.adminService, this.usersCacheService);

    if (this.modeIsAdmin()
        || this._mode === 'addToRole') {
      this.usersLoaded$ = this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== ''),
        concatMap(domainName => this.dataSource.loadUsers(domainName, this.sort, this.userSearch.value, this.page, this.pageSize)),
      );

      this.filteredUsers$ = this.userSearch.valueChanges.pipe(
          filter(value => typeof value === 'string'),
          concatMap(value => this.dataSource.filterUsers(value, this.adminService.selectedDomain$.getValue()))
      );

      this.adminService.closeUserDialog$.subscribe(boolean => {
        if (boolean && this.dialogRef != null) {
          this.dialogRef.close();
        }
      });

      if (this.modeIsAdmin()) {
        this.displayedColumns = [ 'remove', 'uid', 'lastName', 'firstName' ];
      }

      this.usersCacheService.userCreated$.pipe(
        concatMap(() => this.dataSource.loadUsers(
          this.adminService.selectedDomain$.getValue(), this.sort, this.userSearch.value, this.page, this.pageSize)
        ),
      ).subscribe();

      this.usersCacheService.userUpdated$.pipe(
        concatMap(() => this.dataSource.loadUsers(
          this.adminService.selectedDomain$.getValue(), this.sort, this.userSearch.value, this.page, this.pageSize)
        ),
      ).subscribe();

      this.usersCacheService.userRemoved$.pipe(
        concatMap(() => this.dataSource.loadUsers(
          this.adminService.selectedDomain$.getValue(), this.sort, this.userSearch.value, this.page, this.pageSize)
        ),
        concatMap(users => users.length === 0 && this.page > 0 ?
          this.dataSource.loadUsers(
            this.adminService.selectedDomain$.getValue(), this.sort, this.userSearch.value, --this.page, this.pageSize
          ) :
          of(users)
        ),
      ).subscribe();
    }

    this.dataSource.totalNbElements$.subscribe(
        total => this.totalNbElements = total
    );

    if (this._mode === 'roles') {
      this.displayedColumns = [ 'remove', 'uid', 'lastName', 'firstName' ];
      this.usersLoaded$ = this.adminService.selectedRole$.pipe(
          filter(roleId => roleId !== 0),
          concatMap(roleId => this.dataSource.loadUsersForRoleId(roleId, this.sort))
      );
    }

    if (this._mode === 'addToRole') {
      this.displayedColumns = [ 'checkbox', 'uid', 'lastName', 'firstName' ];
      this.domains$ = this.securityService.getAuthenticationSources();

      this.selectDomain.valueChanges.pipe(
        filter(domain => typeof domain === 'string'),
        concatMap(domain => this.dataSource.loadUsers(domain, this.sort, this.userSearch.value, this.page, this.pageSize))
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

    this.currentUserIsAdmin$ = this.securityService.isAdmin(this.sessionService.sessionToken);

    this.adminService.newUserCreated$.pipe(
        filter(res => res === true),
        filter(res => this.adminService.selectedDomain$.getValue() !== ''),
        concatMap(() => this.dataSource.loadUsers(
            this.adminService.selectedDomain$.getValue(),
            this.sort,
            this.userSearch.value,
            this.page,
            this.pageSize,
            true))
    ).subscribe();

    if (this._mode === 'groupUsers') {
      this.usersLoaded$ = this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== ''),
        concatMap(domainName => this.usersCacheService.findGroupUsersInCache(this.groupGid, domainName)),
        tap(users => this.dataSource.connect().next(users))
      );

/*
      this.filteredUsers$ = this.userSearch.valueChanges.pipe(
        filter(value => typeof value === 'string'),
        map(value => this.dataSource.filterUsers(value, this.adminService.selectedDomain$.getValue()))
      );

      this.adminService.closeUserDialog$.subscribe(boolean => {
        if (boolean && this.dialogRef != null) {
          this.dialogRef.close();
        }
      });
*/

      this.displayedColumns = [ 'remove', 'uid', 'lastName', 'firstName' ];
    }

  }

  public modeIsAdmin(): boolean {
    return this._mode === 'admin';
  }

  displayFn(user?: KimiosUser): string {
    return this.userSearch ? this.userSearch.value : '';
  }

  loadUsers(source: string, usersFilter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 20):
      Observable<Array<KimiosUser>> {
    return this.securityService.getUsers(this.sessionService.sessionToken, source).pipe(
        catchError(() => of(new Array<KimiosUser>())),
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
      ).subscribe();
    } else {
      this.dataSource.sortLoadedData(this.sort);
    }
  }

  filterUsers(): void {
    if (this._mode === 'admin'
        || this._mode === 'addToRole') {
      this.dataSource.loadUsers(this.adminService.selectedDomain$.getValue(), this.sort, this.userSearch.value, this.page, this.pageSize).pipe(
        tap(() => this.inputUserSearch.closePanel())
      ).subscribe();
    }
  }

  showUser(user: KimiosUser): void {
    this.userSearch.setValue('');
    this.inputUserSearch.closePanel();
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
        this.userSearch.value, this.page, this.pageSize).subscribe();
  }

  openNewUserDialog(): void {
    this.dialogRef = this.dialog.open(UserDialogComponent, {
      data: {
        'source': this.adminService.selectedDomain$.getValue(),
        'edit' : true
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
    ).pipe(
        () => this.dataSource.loadUsersForRoleId(this.adminService.selectedRole$.getValue(), this.sort)
    ).subscribe();
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

  removeUser(row: KimiosUser): void {
    this.administrationService.deleteUser(
      this.sessionService.sessionToken,
      row.uid,
      this.adminService.selectedDomain$.getValue()
    ).pipe(
      concatMap(() => this.dataSource.loadUsers(
        this.adminService.selectedDomain$.getValue(),
        this.sort,
        this.userSearch.value,
        this.page,
        this.pageSize,
        true))
    ).subscribe();
  }

  removeUserFromGroup(row: KimiosUser): void {
    this.administrationService.removeUserFromGroup(
      this.sessionService.sessionToken,
      row.uid,
      this.groupGid,
      row.source
    ).pipe(
      concatMap(() => this.usersCacheService.removeGroupUserInCache(this.groupGid, row)),
      concatMap(userRemovedOrNot => userRemovedOrNot === true ?
        this.usersCacheService.findGroupUsersInCache(this.groupGid, row.source) :
        of(null)
      ),
      tap(users => {
        if (users != null) {
          this.dataSource.connect().next(users);
        }
      })
    ).subscribe();
  }
}
