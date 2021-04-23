import {MatTableDataSource} from '@angular/material';
import {Share, ShareService, Document as KimiosDocument} from 'app/kimios-client-api';
import {BehaviorSubject} from 'rxjs';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {tap} from 'rxjs/operators';
import {SharesListMode} from './shares-list.component';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {SessionService} from 'app/services/session.service';
import {ColumnDescription} from 'app/main/model/column-description';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

export const SHARES_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'entity',
        matColumnDef: 'entity',
        position: 1,
        matHeaderCellDef: 'entity',
        sticky: false,
        displayName: 'Document',
        cell: (row: Share) => row.entity.name + (DMEntityUtils.dmEntityIsDocument(row.entity) ?
            (row.entity as KimiosDocument).extension != null
            && (row.entity as KimiosDocument).extension !== undefined ?
                '.' + (row.entity as KimiosDocument).extension :
                '' :
            ''),
        title: (row: Share) => row.entity.path
    },
    {
        id: 'creationDate',
        matColumnDef: 'creationDate',
        position: 2,
        matHeaderCellDef: 'creationDate',
        sticky: false,
        displayName: 'Created',
        cell: (row: Share) => new Date(row.creationDate)
    }, {
        id: 'expirationDate',
        matColumnDef: 'expirationDate',
        position: 3,
        matHeaderCellDef: 'expirationDate',
        sticky: false,
        displayName: 'Until',
        cell: (row: Share) => new Date(row.expirationDate)
    }
];

export class ShareDataSource extends MatTableDataSource<Share> {
    private sharesSubject = new BehaviorSubject<Share[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    private mode: SharesListMode;

    constructor(
        private sessionService: SessionService,
        private shareService: ShareService,
        mode: SharesListMode
    ) {
        super();
        this.mode = mode;
    }

    connect(): BehaviorSubject<Share[]> {
        return this.sharesSubject;
    }

    disconnect(): void {
        this.sharesSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(sort: DMEntitySort, filter: string): void {
        if (this.mode === SharesListMode.WITH_ME) {
            this.shareService.listEntitiesSharedWithMe(this.sessionService.sessionToken).pipe(
                tap(shares => this.sharesSubject.next(this._sortData(shares, sort)))
            ).subscribe();
        } else {
            this.shareService.listEntitiesSharedByMe(this.sessionService.sessionToken).pipe(
                tap(shares => this.sharesSubject.next(this._sortData(shares, sort)))
            ).subscribe();
        }
    }

    private _sortData(data: Array<Share>, sort: DMEntitySort): Array<Share> {
        return data.sort((share1, share2) => this._compareDataOnField(share1, share2, sort));
    }

    private _compareDataOnField(element1: Share, element2: Share, sort: DMEntitySort): number {
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
}
