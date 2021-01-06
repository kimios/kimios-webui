import {User as KimiosUser} from 'app/kimios-client-api/model/user';
import {BehaviorSubject, of} from 'rxjs';
import {ColumnDescription} from 'app/main/model/column-description';
import {SessionService} from 'app/services/session.service';
import {SecurityService} from 'app/kimios-client-api';
import {catchError, finalize, tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material';

export const USERS_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'uid',
        matColumnDef: 'uid',
        position: 1,
        matHeaderCellDef: 'uid',
        sticky: false,
        displayName: 'login',
        cell: (row: KimiosUser) => row.uid
    },
    {
        id: 'lastname',
        matColumnDef: 'lastName',
        position: 2,
        matHeaderCellDef: 'lastname',
        sticky: false,
        displayName: 'lastname',
        cell: (row: KimiosUser) => row.lastName
    },
    {
        id: 'firstname',
        matColumnDef: 'firstName',
        position: 3,
        matHeaderCellDef: 'firstname',
        sticky: false,
        displayName: 'firstname',
        cell: (row: KimiosUser) => row.firstName
    }
];

export class UsersDataSource  extends MatTableDataSource<KimiosUser> {

    private usersSubject = new BehaviorSubject<KimiosUser[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    usersCacheByDomain: Map<string, Array<KimiosUser>>;

    constructor(
        private sessionService: SessionService,
        private securityService: SecurityService
    ) {
        super();
        this.usersCacheByDomain = new Map<string, Array<KimiosUser>>();
    }

    connect(): BehaviorSubject<KimiosUser[]> {
        return this.usersSubject;
    }

    disconnect(): void {
        this.usersSubject.complete();
        this.loadingSubject.complete();
    }

    loadUsers(source: string, filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 20): void {
        this.loadingSubject.next(true);
        if ((this.usersCacheByDomain[source] == null || this.usersCacheByDomain[source] === undefined)
            && filter === ''
            && pageIndex === 0
        ) {
            this.securityService.getUsers(this.sessionService.sessionToken, source).pipe(
                catchError(() => of([])),
                tap(users => this.usersCacheByDomain[source] = users),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe(users => this.usersSubject.next(users));
        } else {
            if (this.usersCacheByDomain[source].length === 0) {
                this.usersSubject.next(this.usersCacheByDomain[source]);
            } else {
                let usersToReturn = this.usersCacheByDomain.get(source);
                if (filter !== '') {
                    usersToReturn = usersToReturn.filter(user =>
                        user.uid.toLowerCase().includes(filter.toLowerCase())
                        || user.firstName.toLowerCase().includes(filter.toLowerCase())
                        || user.lastName.toLowerCase().includes(filter.toLowerCase())
                    );
                }
                usersToReturn = usersToReturn.slice(pageIndex * pageSize, pageSize)
                this.usersSubject.next(usersToReturn);
            }
        }
    }
}
