import {Component, OnInit, ViewChild} from '@angular/core';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {FormControl} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {Group, SecurityService} from 'app/kimios-client-api';
import {MatAutocompleteTrigger, Sort} from '@angular/material';
import {AdminService} from 'app/services/admin.service';
import {SessionService} from 'app/services/session.service';
import {catchError, filter, map, tap} from 'rxjs/operators';
import {GROUPS_DEFAULT_DISPLAYED_COLUMNS, GroupsDataSource} from './groups-data-source';

@Component({
  selector: 'admin-domains-groups',
  templateUrl: './admin-domains-groups.component.html',
  styleUrls: ['./admin-domains-groups.component.scss']
})
export class AdminDomainsGroupsComponent implements OnInit {

  dataSource: GroupsDataSource;
  columnsDescription = GROUPS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [ 'gid', 'name' ];

  sort: DMEntitySort = { name: 'name', direction: 'asc' };
  dataSearch = new FormControl('');
  filteredData$: Observable<Array<Group>>;

  page = 0;
  pageSize = 10;
  pageOptions = [ 0, 10, 20 ];

  @ViewChild('inputDataSearch', { read: MatAutocompleteTrigger }) inputDataSearch: MatAutocompleteTrigger;

  constructor(
      private adminService: AdminService,
      private securityService: SecurityService,
      private sessionService: SessionService,
  ) {
    this.filteredData$ = new Observable<Array<Group>>();
  }

  ngOnInit(): void {
    this.dataSource = new GroupsDataSource(this.sessionService, this.securityService);

    this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== ''),
    ).subscribe(
        domainName => this.dataSource.loadData(domainName, this.sort, this.dataSearch.value, this.page, this.pageSize)
    );

    this.filteredData$ = this.dataSearch.valueChanges.pipe(
        map(value => this.dataSource.filterData(value, this.adminService.selectedDomain$.getValue()))
    );
  }

  displayFn(group?: Group): string {
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

  showGroup(group: Group): void {

  }
}
