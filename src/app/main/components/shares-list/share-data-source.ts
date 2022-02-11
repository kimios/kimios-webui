import {MatTableDataSource} from '@angular/material';
import {Document as KimiosDocument, Share} from 'app/kimios-client-api';
import {BehaviorSubject, Observable} from 'rxjs';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {map, tap} from 'rxjs/operators';
import {SharesListMode} from './shares-list.component';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {SessionService} from 'app/services/session.service';
import {ColumnDescription} from 'app/main/model/column-description';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {DateUtils} from 'app/main/utils/date-utils';
import {PropertyFilter} from 'app/main/model/property-filter';
import {ObjectUtils} from 'app/main/utils/object-utils';
import {ShareWithTargetUser} from 'app/main/model/share-with-target-user';
import {ShareExtendedService} from 'app/services/share-extended.service';
import {EntityCacheService} from 'app/services/entity-cache.service';


export const SHARES_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'entity',
        matColumnDef: 'entity',
        position: 1,
        matHeaderCellDef: 'entity',
        sticky: false,
        displayName: 'Document',
        cell: (row: ShareWithTargetUser) => row.entity.name + (DMEntityUtils.dmEntityIsDocument(row.entity) ?
            (row.entity as KimiosDocument).extension != null
            && (row.entity as KimiosDocument).extension !== undefined ?
                '.' + (row.entity as KimiosDocument).extension :
                '' :
            ''),
        title: (row: ShareWithTargetUser) => row.entity.path
    },
    {
        id: 'with',
        matColumnDef: 'with',
        position: 2,
        matHeaderCellDef: 'with',
        sticky: false,
        displayName: 'With',
        cell: (row: ShareWithTargetUser) => row.targetUserId + '@' + row.targetUserSource,
        // title: (row: ShareWithTargetUser) => row.targetUserId + '@' + row.targetUserSource
    },
    {
        id: 'by',
        matColumnDef: 'by',
        position: 2,
        matHeaderCellDef: 'by',
        sticky: false,
        displayName: 'By',
        cell: (row: ShareWithTargetUser) => row.creatorId + '@' + row.creatorSource,
        // title: (row: ShareWithTargetUser) => row.targetUserId + '@' + row.targetUserSource
    },
    {
        id: 'creationDate',
        matColumnDef: 'creationDate',
        position: 3,
        matHeaderCellDef: 'creationDate',
        sticky: false,
        displayName: 'Created',
        cell: (row: ShareWithTargetUser) => `${DateUtils.dateAndTimeShort_FR(new Date(row.creationDate))}`
    }, {
        id: 'expirationDate',
        matColumnDef: 'expirationDate',
        position: 4,
        matHeaderCellDef: 'expirationDate',
        sticky: false,
        displayName: 'Until',
        cell: (row: ShareWithTargetUser) => DateUtils.dateAndTimeShort_FR(new Date(row.expirationDate))
    }, {
        id: 'shareStatus',
        matColumnDef: 'shareStatus',
        position: 5,
        matHeaderCellDef: 'shareStatus',
        sticky: false,
        displayName: 'Status',
        cell: null
    }
];

export class ShareDataSource extends MatTableDataSource<ShareWithTargetUser> {
    private sharesSubject = new BehaviorSubject<ShareWithTargetUser[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    private mode: SharesListMode;

    constructor(
        private sessionService: SessionService,
        private shareExtendedService: ShareExtendedService,
        mode: SharesListMode,
        private entityCacheService: EntityCacheService
    ) {
        super();
        this.mode = mode;
    }

    connect(): BehaviorSubject<ShareWithTargetUser[]> {
        return this.sharesSubject;
    }

    disconnect(): void {
        this.sharesSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(sort: DMEntitySort, filters: Array<PropertyFilter>, refreshCache?: boolean): void {
        if (this.mode === SharesListMode.WITH_ME) {
            this.shareExtendedService.retrieveSharesWithMeWithTargetUser(refreshCache).pipe(
                map(shares => this.filterData(shares, filters)),
                tap(shares => this.sharesSubject.next(this._sortData(shares, sort)))
            ).subscribe();
        } else {
            this.shareExtendedService.retrieveSharesByMeWithTargetUser(refreshCache).pipe(
                map(shares => this.filterData(shares, filters)),
                tap(shares => this.sharesSubject.next(this._sortData(shares, sort)))
            ).subscribe();
        }
    }

    private filterData(shares: Array<ShareWithTargetUser>, filters: Array<PropertyFilter>): Array<ShareWithTargetUser> {
        return shares.filter(share => {
            let filterOk = true;
            let i = 0;
            const nbFilters = filters.length;
            while (filterOk === true && i < nbFilters) {
                const filter = filters[i];
                filterOk = filter.applyFilter(ObjectUtils.extractValueRec(share, filter.propertyName.split('.')));
                i++;
            }
            return filterOk;
        });
    }

    private _sortData(data: Array<ShareWithTargetUser>, sort: DMEntitySort): Array<ShareWithTargetUser> {
        return sort.externalSortData == null || sort.externalSortData === undefined ?
            data.sort((share1, share2) => this._compareDataOnField(share1, share2, sort)) :
            this.applyExternalSortWithExternalData(data, sort.externalSortData, sort.direction === 'asc' ? 1 : -1);
    }

    private _compareDataOnField(element1: ShareWithTargetUser, element2: ShareWithTargetUser, sort: DMEntitySort): number {
        const sortDir = sort.direction === 'asc' ?
            1 :
            -1;
        const sortRes = sortDir * (
            sort.type != null ?
                sort.type === 'number' ?
                    compareNumbers([element1[sort.name]], [element2[sort.name]]) :
                    sort.type === 'DMEntity' ?
                        element1[sort.name].name.localeCompare(element2[sort.name].name) :
                        element1[sort.name].localeCompare(element2[sort.name]) :
                element1[sort.name].localeCompare(element2[sort.name])
        );

        return sortRes;
    }

    private applyExternalSortWithExternalData(data: Array<ShareWithTargetUser>, externalSortData: Map<any, any>, sortDirection: number): Array<ShareWithTargetUser> {
        const sortetIds = Array.from(externalSortData.keys()).sort((key1, key2) =>
            sortDirection * (externalSortData.get(key1) as string).localeCompare(externalSortData.get(key2) as string));
        const mapSharesKey = new Map<number, ShareWithTargetUser>();
        data.forEach(share => mapSharesKey.set(share.id, share));
        const shares = sortetIds.map(id => mapSharesKey.get(id));

        return shares;
    }

    private filterSharesByStatus(shares: Array<ShareWithTargetUser>, statusFilter: Array<Share.ShareStatus>): Array<ShareWithTargetUser> {
        return shares.filter(share => statusFilter.includes(share.shareStatus));
    }

    updateDocumentData(docId: number): void {
        const data = this.connect().getValue();
        const indexesToUpdate: Array<number> = new Array<number>();
        data.forEach((share, idx) => {
            if (share.entity.uid === docId) {
                indexesToUpdate.push(idx);
            }
        });

        this.entityCacheService.findDocumentInCache(docId).pipe(
          tap(doc => indexesToUpdate.forEach(idx => data[idx].entity = doc)),
          tap(() => this.sharesSubject.next(data))
        ).subscribe();
    }
}
