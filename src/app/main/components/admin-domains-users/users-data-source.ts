import {User as KimiosUser} from 'app/kimios-client-api/model/user';
import {BehaviorSubject, Observable} from 'rxjs';
import {ColumnDescription} from 'app/main/model/column-description';
import {SessionService} from 'app/services/session.service';
import {SecurityService} from 'app/kimios-client-api';
import {concatMap, finalize, map, tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {AdminService} from 'app/services/admin.service';
import {UsersCacheService} from 'app/services/users-cache.service';

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
    public totalNbElements$: BehaviorSubject<number>;

    constructor(
        private sessionService: SessionService,
        private securityService: SecurityService,
        private adminService: AdminService,
        private usersCacheService: UsersCacheService
    ) {
        super();
        this.totalNbElements$ = new BehaviorSubject<number>(0);
    }

    connect(): BehaviorSubject<KimiosUser[]> {
        return this.usersSubject;
    }

    disconnect(): void {
        this.usersSubject.complete();
        this.loadingSubject.complete();
    }

    loadUsers(source: string, sort: DMEntitySort, filter, pageIndex, pageSize, refresh?): Observable<Array<KimiosUser>> {
        this.loadingSubject.next(true);
        return this.usersCacheService.findUsersInCache(source).pipe(
          map(allSourceUsers => allSourceUsers.length !== 0 ?
            this.makePage(allSourceUsers, sort, filter, pageIndex, pageSize) :
            allSourceUsers
          ),
          tap(usersToReturn => this.usersSubject.next(usersToReturn)),
          finalize(() => this.loadingSubject.next(false))
        );
    }

    filterUsers(value: string, source): Observable<Array<KimiosUser>> {
        return this.usersCacheService.findUsersInCache(source).pipe(
          map(users => this._filterUsers(value, users))
        );
    }

    private _filterUsers(value: string, userList: Array<KimiosUser>): Array<KimiosUser> {
        return  userList.filter(user =>
            user.uid.toLowerCase().includes(value.toLowerCase())
            || user.firstName.toLowerCase().includes(value.toLowerCase())
            || user.lastName.toLowerCase().includes(value.toLowerCase())
        );
    }

    private _sortUsers(users: Array<KimiosUser>, sort: DMEntitySort): Array<KimiosUser> {
        return users.sort((user1, user2) => this._compareUsersOnField(user1, user2, sort));
    }

    private _compareUsersOnField(user1: KimiosUser, user2: KimiosUser, sort: DMEntitySort): number {
        const sortDir = sort.direction === 'asc' ?
            1 :
            -1;
        const sortRes = sortDir * user1[sort.name].localeCompare(user2[sort.name]);

        return sortRes;
    }

    sortLoadedData(sort: DMEntitySort): void {
        const sortedData = this._sortUsers(this.usersSubject.getValue(), sort);
        this.usersSubject.next(sortedData);
    }

    loadUsersForRoleId(roleId: number, sort: DMEntitySort): Observable<Array<KimiosUser>> {
        return this.adminService.findUsersWithRole(roleId).pipe(
            concatMap(roles => this.adminService.loadUsersFromUsersRole(roles)),
            map(users => this._sortUsers(users, sort)),
            tap(usersSorted => this.usersSubject.next(usersSorted))
        );
    }

    private makePage(allSourceUsers: Array<KimiosUser>, sort: DMEntitySort, filter: any, pageIndex: any, pageSize: any): Array<KimiosUser> {
        let usersToReturn = allSourceUsers;
        if (filter !== '') {
            usersToReturn = this._filterUsers(filter, usersToReturn);
        }
        this.totalNbElements$.next(usersToReturn.length);
        usersToReturn = this._sortUsers(usersToReturn, sort);
        usersToReturn = usersToReturn.slice(pageIndex * pageSize, pageSize * (pageIndex + 1));
        return usersToReturn;
    }
}
