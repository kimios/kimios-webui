import {MatTableDataSource} from '@angular/material';
import {Log, LogService, User as KimiosUser} from 'app/kimios-client-api';
import {ColumnDescription} from 'app/main/model/column-description';
import {BehaviorSubject} from 'rxjs';
import {SessionService} from 'app/services/session.service';
import {map, tap} from 'rxjs/operators';
import {DMEntitySort} from '../../model/dmentity-sort';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {OperationTypeMapping} from '../../model/operation-type-mapping';

export class LogDataSource extends MatTableDataSource<Log> {
    private logsSubject = new BehaviorSubject<Log[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();
    public totalNbElements$: BehaviorSubject<number>;

    constructor(
        private sessionService: SessionService,
        private logService: LogService
    ) {
        super();
        this.totalNbElements$ = new BehaviorSubject<number>(0);
    }

    connect(): BehaviorSubject<Log[]> {
        return this.logsSubject;
    }

    disconnect(): void {
        this.logsSubject.complete();
        this.loadingSubject.complete();
    }

    loadLogs(documentId: number, sort: DMEntitySort): void {
        this.logService.getDocumentLogs(
            this.sessionService.sessionToken,
            documentId
        ).pipe(
            map(logs => this._sortLogs(logs, sort)),
            tap(logs => this.logsSubject.next(logs))
        ).subscribe();
    }


    private _sortLogs(logs: Array<Log>, sort: DMEntitySort): Array<Log> {
        return logs.sort((log1, log2) => this._compareLogsOnField(log1, log2, sort));
    }

    private _compareLogsOnField(log1: Log, log2: Log, sort: DMEntitySort): number {
        const sortDir = sort.direction === 'asc' ?
            1 :
            -1;
        const sortRes = sortDir * (
            sort.type != null ?
                sort.type === 'number' ?
                    compareNumbers([log1[sort.name]], [log2[sort.name]]) :
                    log1[sort.name].localeCompare(log2[sort.name]) :
                log1[sort.name].localeCompare(log2[sort.name])
        );

        return sortRes;
    }
    
    public sortLoadedData(sort: DMEntitySort): void {
        const sortedData = this._sortLogs(this.logsSubject.getValue(), sort);
        this.logsSubject.next(sortedData);
    }
}

export const LOG_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'date',
        matColumnDef: 'date',
        position: 1,
        matHeaderCellDef: 'date',
        sticky: false,
        displayName: 'Date',
        cell: (row: Log) => row.date
    },
    {
        id: 'author',
        matColumnDef: 'author',
        position: 2,
        matHeaderCellDef: 'author',
        sticky: false,
        displayName: 'Author',
        cell: (row: Log) => row.user + '@' + row.userSource
    },
    {
        id: 'operation',
        matColumnDef: 'operation',
        position: 3,
        matHeaderCellDef: 'operation',
        sticky: false,
        displayName: 'operation',
        cell: (row: Log) => OperationTypeMapping[row.operation]
    }
];
