import {Component, OnInit, ViewChild} from '@angular/core';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {FormControl} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {AdministrationService, Group, SecurityService} from 'app/kimios-client-api';
import {MatAutocompleteTrigger, MatDialog, MatDialogRef, PageEvent, Sort} from '@angular/material';
import {AdminService} from 'app/services/admin.service';
import {SessionService} from 'app/services/session.service';
import {catchError, filter, map, tap} from 'rxjs/operators';
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

  @ViewChild('inputDataSearch', { read: MatAutocompleteTrigger }) inputDataSearch: MatAutocompleteTrigger;

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      private dialog: MatDialog
  ) {
    this.filteredData$ = new Observable<Array<GroupWithData>>();
  }

  ngOnInit(): void {
    this.dataSource = new GroupsDataSource(this.sessionService, this.securityService, this.administrationService);

    this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== ''),
    ).subscribe(
        domainName => this.dataSource.loadData(domainName, this.sort, this.dataSearch.value, this.page, this.pageSize)
    );

    this.filteredData$ = this.dataSearch.valueChanges.pipe(
        map(value => this.dataSource.filterData(value, this.adminService.selectedDomain$.getValue()))
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
    this.dataSource.loadData(
        this.adminService.selectedDomain$.getValue(),
        this.sort,
        this.dataSearch.value,
        this.page,
        this.pageSize
    );
  }

  filterData(): void {
    this.dataSource.loadData(this.adminService.selectedDomain$.getValue(), this.sort, this.dataSearch.value, this.page, this.pageSize);
    this.inputDataSearch.closePanel();
  }

  showGroup(group: GroupWithData): void {
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
}
