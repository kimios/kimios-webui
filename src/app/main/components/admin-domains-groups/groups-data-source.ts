import {BehaviorSubject, combineLatest, from, Observable, of} from 'rxjs';
import {AdministrationService, Group, SecurityService, User as KimiosUser} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {catchError, concatMap, finalize, map, tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material';
import {ColumnDescription} from 'app/main/model/column-description';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {UsersCacheService} from 'app/services/users-cache.service';

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
    dataCacheUsersByDomain: Map<string, Array<KimiosUser>>;
    dataCacheByUser: Map<string, Array<GroupWithData>>;

    dataFieldsForFiltering = [ 'name', 'gid'];

    constructor(
        private sessionService: SessionService,
        private securityService: SecurityService,
        private administrationService: AdministrationService,
        private usersCacheService: UsersCacheService
    ) {
        super();
        this.dataCacheByDomain = new Map<string, Array<GroupWithData>>();
        this.dataCacheUsersByDomain = new Map<string, Array<KimiosUser>>();
        this.dataCacheByUser = new Map<string, Array<GroupWithData>>();
        this.totalNbElements$ = new BehaviorSubject<number>(0);
    }

    connect(): BehaviorSubject<GroupWithData[]> {
        return this.dataSubject;
    }

    disconnect(): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(source: string, sort: DMEntitySort, filter, pageIndex, pageSize, reload?: boolean): void {
        this.loadingSubject.next(true);
        if (this.dataCacheByDomain.get(source) == null
            || this.dataCacheByDomain.get(source) === undefined
            || reload === true) {
            this.usersCacheService.findGroupsInCache(source).pipe(
                catchError(() => of([])),
                map(elements => this._convertAllToGroupWithData(elements)),
                tap(data => this._setCacheForDomain(source, data)),
                tap(() => this._loadNbUsers(source)),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe(data => this._loadDataFromCache(source, sort, filter, pageIndex, pageSize));
        } else {
            this._loadDataFromCache(source, sort, filter, pageIndex, pageSize);
        }
    }

    _initCacheForDomain(source: string): Observable<boolean> {
        return this.isCacheSetForDomain(source) ?
            of(this.isCacheSetForDomain(source)) :
            this.usersCacheService.findGroupsInCache(source).pipe(
                catchError(() => of([])),
                map(elements => this._convertAllToGroupWithData(elements)),
                tap(data => this._setCacheForDomain(source, data)),
                concatMap(date => of(true))
            );
    }

    isCacheSetForDomain(source: string): boolean {
        return (this.dataCacheByDomain.get(source) != null);
    }

    loadDataForUserId(source: string, sort: DMEntitySort, userId: string): void {
        if (this.dataCacheByDomain.get(source) == null
            || this.dataCacheByDomain.get(source) === undefined) {
            this.usersCacheService.findGroupsInCache(source).pipe(
                catchError(() => of([])),
                map(elements => this._convertAllToGroupWithData(elements)),
                tap(data => this._setCacheForDomain(source, data))
            ).subscribe();
        }
        if (this.dataCacheByUser.get(source) == null
            || this.dataCacheByUser.get(source) === undefined) {
            this._getManageableGroupsAsGroupWithData(userId, source).pipe(
                tap(data => this._setCacheForUserId(userId, data))
            ).subscribe(
                data => this.dataSubject.next(this._sortData(data, sort))
            );
        } else {
            this.dataSubject.next(this._loadDataFromCacheUserId(userId, sort));
        }
    }

    _loadDataFromCacheUserId(userId,  sort: DMEntitySort): Array<GroupWithData> {
        return (this._sortData(this.dataCacheByUser.get(userId), sort));
    }

    private _setCacheForUserId(userId: string, data: Array<GroupWithData>): void {
        this.dataCacheByUser.set(userId, data);
    }

    private _getManageableGroupsAsGroupWithData(userId: string, source: string): Observable<Array<GroupWithData>> {
        return this.administrationService.getManageableGroups(this.sessionService.sessionToken, userId, source).pipe(
            map(groups => groups.map(group => this._createGroupWithDataFromGroup(group)))
        );
}

    private _createGroupWithDataFromGroup(group: Group): GroupWithData {
        return <GroupWithData> {
            gid: group.gid,
            name: group.name,
            source: group.source,
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

    _loadDomainDataFromCache(source: string): Array<GroupWithData> {
        return this.dataCacheByDomain.get(source);
    }

    filterData(value: string, source): Array<GroupWithData> {
        return this._filterDataList(value, this.dataCacheByDomain.get(source));
    }

    private _filterDataList(value: string, list: Array<GroupWithData>): Array<GroupWithData> {
        return value !== '' ?
            list.filter(
                element => this.dataFieldsForFiltering
                        .find(field => element[field] != null && element[field].toLowerCase().includes(value.toLowerCase()))
                    !== undefined
            ) :
            list;
    }

    private _sortData(data: Array<GroupWithData>, sort: DMEntitySort): Array<GroupWithData> {
        return data.sort((group1, group2) => this._compareDataOnField(group1, group2, sort));
    }

    private _compareDataOnField(element1: GroupWithData, element2: GroupWithData, sort: DMEntitySort): number {
        const sortDir = sort.direction === 'asc' ?
            1 :
            -1;
        const sortRes = sortDir * (
            sort.type != null && sort.type === 'number' ?
                compareNumbers([element1[sort.name]], [element2[sort.name]]) :
                element1[sort.name].localeCompare(element2[sort.name])
        );

        return sortRes;
    }

    private _loadNbUsers(source: string): void {
        const groups = this.dataCacheByDomain.get(source);
        if (groups.length === 0) {
            return;
        }
        from(groups).pipe(
            concatMap(group => combineLatest(of(group), this.usersCacheService.findGroupUsersInCache(group.gid, source))),
            map(([ group, users ]) => {
                this._updateElementInDataCache(source, group, 'nbUsers', users.length);
                this.dataCacheUsersByDomain[source] = users;
            })
        ).subscribe();
    }

    public loadNbUser(gid: string, source: string): void {
        this.usersCacheService.findGroupUsersInCache(gid, source).pipe(
            map(users => {
                this._updateElementInDataCacheFromGid(source, gid, 'nbUsers', users.length);
                this.dataCacheUsersByDomain[source] = users;
            })
        ).subscribe();
    }

    private _updateElementInDataCache(source: string, group: GroupWithData, key: string, value: number): void {
        const idx = this.dataCacheByDomain.get(source).findIndex(grp => grp.gid === group.gid);
        if (idx === -1) {
            return;
        }
        this.dataCacheByDomain.get(source)[idx][key] = value;
    }

    private _updateElementInDataCacheFromGid(source: string, groupId: string, key: string, value: number): void {
        if (this.dataCacheByDomain === null
            || this.dataCacheByDomain === undefined
            || this.dataCacheByDomain.size === 0
        ) {
            return;
        }
        const idx = this.dataCacheByDomain.get(source).findIndex(grp => grp.gid === groupId && grp.source === source);
        if (idx === -1) {
            return;
        }
        this.dataCacheByDomain.get(source)[idx][key] = value;
    }

    addToData(group: GroupWithData): void {
        const data = this.dataSubject.getValue();
        data.push(group);
        this.dataSubject.next(data);
    }

    removeFromData(gid: string): void {
        const data = this.dataSubject.getValue().filter(grp => grp.gid !== gid);
        this.dataSubject.next(data);
    }

    updateGroup(source: string, gid: string): void {
        const groupsWithData = this.dataSubject.getValue();
        const idx = groupsWithData.findIndex(groupWithDataa => groupWithDataa.gid === gid);
        if (idx === -1) {
            return;
        }
        this.usersCacheService.findGroupInCache(source, gid).pipe(
          concatMap(group => combineLatest(of(group), this.usersCacheService.findGroupUsersInCache(gid, source))),
          map(([group, users]) => {
              const gWithData = this._createGroupWithDataFromGroup(group);
              gWithData.nbUsers = users.length;
              return gWithData;
          }),
          tap(gWithData => {
              const localDomainGroupsCache = this.dataCacheByDomain.get(source);
              const idxGrp = localDomainGroupsCache.findIndex(g => g.source === gWithData.source && g.gid === gWithData.gid);
              if (idxGrp === -1) {
                  return;
              }
              this.dataCacheByDomain.get(source)[idxGrp] = gWithData;
          }),
          tap(gWithData => {
              const data = this.connect().getValue();
              const idxGrp = data.findIndex(g => g.source === gWithData.source && g.gid === gWithData.gid);
              if (idxGrp === -1) {
                  return;
              }
              data[idxGrp] = gWithData;
              this.dataSubject.next(data);
          })
        ).subscribe();
    }
}

