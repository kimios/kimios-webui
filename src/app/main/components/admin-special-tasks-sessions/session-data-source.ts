import {MatTableDataSource} from '@angular/material';
import {AdministrationService, Session, User as KimiosUser} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {BehaviorSubject} from 'rxjs';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {ColumnDescription} from 'app/main/model/column-description';
import {tap} from 'rxjs/operators';

export const SESSIONS_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'sessionUid',
        matColumnDef: 'sessionUid',
        position: 1,
        matHeaderCellDef: 'sessionUid',
        sticky: false,
        displayName: 'sessionUid',
        cell: (row: Session) => row.sessionUid
    },
    /*{
        id: 'userName',
        matColumnDef: 'userName',
        position: 2,
        matHeaderCellDef: 'userName',
        sticky: false,
        displayName: 'userName',
        cell: (row: Session) => row.userName
    },
    {
        id: 'userSource',
        matColumnDef: 'userSource',
        position: 3,
        matHeaderCellDef: 'userSource',
        sticky: false,
        displayName: 'userSource',
        cell: (row: Session) => row.userSource
    },*/
    {
        id: 'lastUse',
        matColumnDef: 'lastUse',
        position: 4,
        matHeaderCellDef: 'lastUse',
        sticky: false,
        displayName: 'lastUse',
        cell: (row: Session) => new Date(row.lastUse)
    }
];

export class SessionDataSource extends MatTableDataSource<Session> {

    private sessionsSubject = new BehaviorSubject<Session[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(
        private sessionService: SessionService,
        private administrationService: AdministrationService,
    ) {
        super();
    }

    connect(): BehaviorSubject<Session[]> {
        return this.sessionsSubject;
    }

    disconnect(): void {
        this.sessionsSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(user: KimiosUser, sort: DMEntitySort, filter: string): void {
        this.administrationService.getEnabledSessions(this.sessionService.sessionToken, user.uid, user.source).pipe(
            tap(sessions => this.sessionsSubject.next(this._sortData(sessions, sort))),
        ).subscribe();
    }

    private _sortData(data: Array<Session>, sort: DMEntitySort): Array<Session> {
        const array = data.sort((session1, session2) => this._compareDataOnField(session1, session2, sort));
        return array;
    }

    private _compareDataOnField(element1: Session, element2: Session, sort: DMEntitySort): number {
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
}
