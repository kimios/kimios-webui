import {BehaviorSubject, of} from 'rxjs';
import {Group, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {catchError, finalize, map, tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material';
import {ColumnDescription} from 'app/main/model/column-description';

export interface GroupWithData extends Group {
    nbUsers: number;
}

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
    }, {
        id: 'nbUsers',
        matColumnDef: 'nbUsers',
        position: 3,
        matHeaderCellDef: 'nbUsers',
        sticky: false,
        displayName: 'total users',
        cell: null
    }
];

export class GroupsDataSource extends MatTableDataSource<GroupWithData> {
    private dataSubject = new BehaviorSubject<GroupWithData[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();
    public totalNbElements$: BehaviorSubject<number>;

    dataCacheByDomain: Map<string, Array<GroupWithData>>;

    dataFieldsForFiltering = [ 'name', 'gid'];

    constructor(
        private sessionService: SessionService,
        private securityService: SecurityService
    ) {
        super();
        this.dataCacheByDomain = new Map<string, Array<GroupWithData>>();
        this.totalNbElements$ = new BehaviorSubject<number>(0);
    }

    connect(): BehaviorSubject<GroupWithData[]> {
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
                map(elements => this._convertAllToGroupWithData(elements)),
                tap(data => this._setCacheForDomain(source, data)),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe(data => this._loadDataFromCache(source, sort, filter, pageIndex, pageSize));
        } else {
            this._loadDataFromCache(source, sort, filter, pageIndex, pageSize);
        }
    }

    private _createGroupWithDataFromGroup(group: Group): GroupWithData {
        return <GroupWithData> {
            gid: group.gid,
            name: group.name,
            nbUsers: -1
        };
    }

    private _convertAllToGroupWithData(elements: Array<Group>): Array<GroupWithData> {
        return elements.map(elem => this._createGroupWithDataFromGroup(elem));
    }

    private _setCacheForDomain(domainName: string, data: Array<GroupWithData>): void {
        this.dataCacheByDomain.set(domainName, data);
    }

    _loadDataFromCache(source: string, sort: DMEntitySort, filter, pageIndex, pageSize): void {
        let dataToReturn = new Array<GroupWithData>();
        if (this.dataCacheByDomain.get(source).length !== 0) {
            dataToReturn = this.dataCacheByDomain.get(source);
            if (filter !== '') {
                dataToReturn = this._filterDataList(filter, dataToReturn);
            }
            this.totalNbElements$.next(dataToReturn.length);
            dataToReturn = this._sortData(dataToReturn, sort)
                .slice(pageIndex * pageSize, pageSize * (pageIndex + 1));
        }
        this.dataSubject.next(dataToReturn);
    }

    filterData(value: string, source): Array<GroupWithData> {
        return this._filterDataList(value, this.dataCacheByDomain.get(source));
    }

    private _filterDataList(value: string, list: Array<GroupWithData>): Array<GroupWithData> {
        return  list.filter(
            element => this.dataFieldsForFiltering
                    .find(field => element[field] != null && element[field].toLowerCase().includes(value.toLowerCase()))
                !== undefined
        );
    }

    private _sortData(data: Array<GroupWithData>, sort: DMEntitySort): Array<GroupWithData> {
        return data.sort((group1, group2) => this._compareDataOnField(group1, group2, sort));
    }

    private _compareDataOnField(element1: GroupWithData, element2: GroupWithData, sort: DMEntitySort): number {
        const sortDir = sort.direction === 'asc' ?
            1 :
            -1;
        const sortRes = sortDir * element1[sort.name].localeCompare(element2[sort.name]);

        return sortRes;
    }
}

