import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {combineLatest, iif, Observable, of} from 'rxjs';
import {AdministrationService, Group, SecurityService, User as KimiosUser} from 'app/kimios-client-api';
import {MatAutocompleteTrigger, MatDialog, MatDialogRef, PageEvent, Sort} from '@angular/material';
import {AdminService} from 'app/services/admin.service';
import {SessionService} from 'app/services/session.service';
import {catchError, concatMap, filter, map, startWith, tap} from 'rxjs/operators';
import {GROUPS_DEFAULT_DISPLAYED_COLUMNS, GroupsDataSource, GroupWithData} from './groups-data-source';
import {GroupDialogComponent} from 'app/main/components/group-dialog/group-dialog.component';

const sortTypeMapping = {
  'nbUsers' : 'number'
};

@Component({
  selector: 'admin-domains-groups',
  templateUrl: './admin-domains-groups.component.html',
  styleUrls: ['./admin-domains-groups.component.scss']
})
export class AdminDomainsGroupsComponent implements OnInit {

  dataSource: GroupsDataSource;
  columnsDescription = GROUPS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [ 'gid', 'name', 'nbUsers' ];

  sort: DMEntitySort = { name: 'name', direction: 'asc' };
  dataSearch = new FormControl('');
  filteredData$: Observable<Array<GroupWithData>>;

  page = 0;
  pageSize = 10;
  pageOptions = [ 10, 20 ];

  totalNbElements: number;

  dialogRef: MatDialogRef<GroupDialogComponent, any>;

  @Input()
  mode: 'domain' | 'user';
  @Input()
  user: KimiosUser;
  @Input()
  edit = false;

  @ViewChild('inputDataSearch', { read: MatAutocompleteTrigger }) inputDataSearch: MatAutocompleteTrigger;

  userGroups: FormGroup;
  showSpinnerFormSubmit: false;

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      private dialog: MatDialog,
      private fb: FormBuilder
  ) {
    this.filteredData$ = new Observable<Array<GroupWithData>>();
    this.userGroups = this.fb.group({});
  }

  ngOnInit(): void {
    if (this.mode == null
        || this.mode === undefined) {
      this.mode = 'domain';
    }
    if (! this.modeIsDomain()) {
      this.displayedColumns = [ 'gid', 'name' ];
      if (this.edit) {
        this.displayedColumns.unshift('remove');
      }
      this.columnsDescription = this.columnsDescription.filter(colDesc => this.displayedColumns.findIndex(
          elem => elem === colDesc.matColumnDef) !== -1);
    }

    this.dataSource = new GroupsDataSource(this.sessionService, this.securityService, this.administrationService);

    this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== '')
    ).subscribe(
        domainName => {
          if (this.modeIsDomain()) {
            this.user = null;
            this.dataSource.loadData(domainName, this.sort, this.dataSearch.value, this.page, this.pageSize);
          }
        }
    );

    this.filteredData$ = this.dataSearch.valueChanges.pipe(
        startWith(''),
        concatMap(filterValue => combineLatest(of(filterValue),
            this.dataSource._initCacheForDomain(this.adminService.selectedDomain$.getValue()))),
        map(([filterValue, booleanValue]) => this.dataSource.filterData(filterValue, this.adminService.selectedDomain$.getValue())),
        concatMap(groups => iif(() => this.modeIsDomain(), of(groups), of(this._removeUserGroups(groups))))
    );

    this.dataSource.totalNbElements$.subscribe(
        total => this.totalNbElements = total
    );

    this.dataSource.elementUpdated$.subscribe(
        group => {
          console.log('groupUpdated : ');
          console.dir(group);
        }
    );

    this.dataSource.connect().subscribe(
        data => this.userGroups = this._mergeFormGroup(this.userGroups, data)
    );

    if (! this.modeIsDomain()) {
      this.dataSource.loadDataForUserId(this.user.source, this.sort, this.user.uid);
    }

    if (this.modeIsDomain()) {
      this.adminService.groupCreated$.pipe(
          filter(res => res === true),
          tap(res =>
              this.dataSource.loadData(
                  this.adminService.selectedDomain$.getValue(),
                  this.sort,
                  this.dataSearch.value,
                  this.page,
                  this.pageSize,
                  true
              )
          )
      ).subscribe();
    }

  }

  private _mergeFormGroup(formGroup: FormGroup, groups: Array<GroupWithData>): FormGroup {
    const formGroupNew = this.fb.group({});
    if (formGroup != null
        && formGroup !== undefined) {
      Object.keys(formGroup.controls).forEach(control => {
        if (formGroup.get(control).value === false) {
          formGroupNew.addControl(control, this.fb.control(formGroup.get(control).value));
        }
      });
    }
    groups.forEach(group => {
      formGroup.addControl(group.gid, this.fb.control(true));
    });

    return formGroup;
  }

  modeIsDomain(): boolean {
    return this.mode === 'domain';
  }

  displayFn(group?: GroupWithData): string {
    return this.dataSearch ? this.dataSearch.value : '';
  }

  loadData(source: string, dataFilter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 20):
      Observable<Array<Group>> {
    return this.securityService.getGroups(this.sessionService.sessionToken, source).pipe(
        catchError(() => of(new Array<Group>())),
        tap(data => console.log('returned ' + data.length + ' elements')),
        map(data => data),
    );
  }

  sortData($event: Sort): void {
    this.sort.name = $event.active;
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    if (sortTypeMapping[this.sort.name] != null) {
      this.sort.type = sortTypeMapping[this.sort.name];
    }
    if (this.mode === 'domain') {
      this.dataSource.loadData(
          this.adminService.selectedDomain$.getValue(),
          this.sort,
          this.dataSearch.value,
          this.page,
          this.pageSize
      );
    } else {
      this.dataSource.loadDataForUserId(this.adminService.selectedDomain$.getValue(), this.sort, this.user.uid);
    }
  }

  filterData(): void {
    if (this.modeIsDomain()) {
      this.dataSource.loadData(this.adminService.selectedDomain$.getValue(), this.sort, this.dataSearch.value, this.page, this.pageSize);
      this.inputDataSearch.closePanel();
    }
  }

  showGroup(group: GroupWithData): void {
    if (! this.modeIsDomain()) {
      if (this.userGroups.get(group.gid) != null
          && this.userGroups.get(group.gid).value === false) {
        this.userGroups.removeControl(group.gid);
      }
      const val = this.dataSearch.value;
      this.dataSource.addToData(group);
      this.dataSearch.patchValue(val, {onlySelf: true, emitEvent: true, emitViewToModelChange: true});
      return;
    }
    const data = group != null && group !== undefined ? {
      'group': group
    } : {
      'source': this.adminService.selectedDomain$.getValue()
    };
    this.dialogRef = this.dialog.open(GroupDialogComponent, {
      data: data
    });
  }

  handlePageEvent($event: PageEvent): void {
    this.page = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this._updatePage();
  }

  _updatePage(): void {
    this.dataSource.loadData(this.adminService.selectedDomain$.getValue(), this.sort,
        this.dataSearch.value, this.page, this.pageSize);
  }

  close(): void {

  }

  onSubmit(): void {
    const mapGroups = new Map<string, boolean>();
    Object.keys(this.userGroups.controls).forEach(key => mapGroups.set(key, this.userGroups.get(key).value));
    this.administrationService.getManageableGroups(
        this.sessionService.sessionToken, this.user.uid, this.adminService.selectedDomain$.getValue()).pipe(
        map(groups => {
          const newMap = new Map<string, boolean>();
          const groupsGid = groups.map(grp => grp.gid);
          mapGroups.forEach((value, key) => {
            if (!groupsGid.includes(key)
                || value === false) {
              newMap.set(key, value);
            }
          });
          return newMap;
        }),
        concatMap(mapGroupsNew => this.adminService.saveUserGroups(this.user.uid, mapGroupsNew))
    ).subscribe(
        next => console.log('saveUserGroups() is ' + next)
    );
  }

  removeFromData(row: GroupWithData): void {
    if (this.userGroups.get(row.gid) != null) {
      this.userGroups.controls[row.gid].setValue(false, {onlySelf: true});
    }
    const val = this.dataSearch.value;
    this.dataSource.removeFromData(row.gid);
    this.dataSearch.patchValue(val, {onlySelf: true, emitEvent: true, emitViewToModelChange: true});
  }

  private _removeUserGroups(groups: Array<GroupWithData>): Array<GroupWithData> {
    if (this.user != null
        && this.user !== undefined
        && this.userGroups != null
        && this.userGroups !== undefined) {

      groups = groups.filter(group =>
          this.userGroups.get(group.gid) == null
          || this.userGroups.get(group.gid).value === false
      );
    }
    return groups;
  }
}
