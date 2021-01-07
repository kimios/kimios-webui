import {BehaviorSubject, of} from 'rxjs';
import {Group, SecurityService, User as KimiosUser} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {catchError, finalize, tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material';
import {ColumnDescription} from 'app/main/model/column-description';

export const GROUPS_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'gid',
        matColumnDef: 'gid',
        position: 1,
        matHeaderCellDef: 'gid',
        sticky: false,
        displayName: 'gid',
        cell: null
    },
    {
        id: 'name',
        matColumnDef: 'name',
        position: 2,
        matHeaderCellDef: 'name',
        sticky: false,
        displayName: 'name',
        cell: null
    }
];

export class GroupsDataSource extends MatTableDataSource<Group> {
    private dataSubject = new BehaviorSubject<Group[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    dataCacheByDomain: Map<string, Array<Group>>;

    dataFieldsForFiltering = [ 'name', 'gid'];

    constructor(
        private sessionService: SessionService,
        private securityService: SecurityService
    ) {
        super();
        this.dataCacheByDomain = new Map<string, Array<Group>>();
    }

    connect(): BehaviorSubject<Group[]> {
        return this.dataSubject;
    }

    disconnect(): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(source: string, sort: DMEntitySort, filter, pageIndex, pageSize): void {
        this.loadingSubject.next(true);
        if (this.dataCacheByDomain.get(source) == null
            || this.dataCacheByDomain.get(source) === undefined) {
            this.securityService.getGroups(this.sessionService.sessionToken, source).pipe(
                catchError(() => of([])),
                tap(data => this.dataCacheByDomain.set(source, data)),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe(data => this._loadDataFromCache(source, sort, filter, pageIndex, pageSize));
        } else {
            this._loadDataFromCache(source, sort, filter, pageIndex, pageSize);
        }
    }

    _loadDataFromCache(source: string, sort: DMEntitySort, filter, pageIndex, pageSize): void {
        let dataToReturn = new Array<Group>();
        if (this.dataCacheByDomain.get(source).length !== 0) {
            dataToReturn = this.dataCacheByDomain.get(source);
            if (filter !== '') {
                dataToReturn = this._filterDataList(filter, dataToReturn);
            }
            dataToReturn = this._sortData(dataToReturn, sort)
                .slice(pageIndex * pageSize, pageSize);
        }
        this.dataSubject.next(dataToReturn);
    }

    filterData(value: string, source): Array<Group> {
        return this._filterDataList(value, this.dataCacheByDomain.get(source));
    }

    private _filterDataList(value: string, list: Array<Group>): Array<Group> {
        return  list.filter(
            element => this.dataFieldsForFiltering
                    .find(field => element[field] != null && element[field].toLowerCase().includes(value.toLowerCase()))
                !== undefined
        );
    }

    private _sortData(data: Array<Group>, sort: DMEntitySort): Array<Group> {
        return data.sort((group1, group2) => this._compareDataOnField(group1, group2, sort));
    }

    private _compareDataOnField(element1: Group, element2: Group, sort: DMEntitySort): number {
        const sortDir = sort.direction === 'asc' ?
            1 :
            -1;
        const sortRes = sortDir * element1[sort.name].localeCompare(element2[sort.name]);

        return sortRes;
    }
}

