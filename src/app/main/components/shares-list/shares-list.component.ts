import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {AdministrationService, DMEntity, ShareService, User, User as KimiosUser} from 'app/kimios-client-api';
import {ShareDataSource, SHARES_DEFAULT_DISPLAYED_COLUMNS} from './share-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';
import {IconService} from 'app/services/icon.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {combineLatest, Observable, of} from 'rxjs';
import {concatMap, filter, flatMap, map, tap} from 'rxjs/operators';

export enum SharesListMode {
  WITH_ME = 'withMe',
  BY_ME = 'byMe'
}

const sortTypeMapping = {
  'creationDate' : 'number',
  'expirationDate' : 'number',
  'entity' : 'DMEntity',
  'with': 'external'
};

@Component({
  selector: 'shares-list',
  templateUrl: './shares-list.component.html',
  styleUrls: ['./shares-list.component.scss']
})
export class SharesListComponent implements OnInit {

  @Input()
  mode: SharesListMode = SharesListMode.WITH_ME;

  dataSource: ShareDataSource;
  sort: DMEntitySort;
  filter = '';

  columnsDescription = SHARES_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns: Array<string>;

  users: Map<string, KimiosUser>;
  shareUser: Map<number, User>;

  constructor(
      private sessionService: SessionService,
      private shareService: ShareService,
      private iconService: IconService,
      private administrationService: AdministrationService
  ) {
    this.sort = <DMEntitySort> {
      name: 'creationDate',
      direction: 'desc',
      type: 'number'
    };
    this.displayedColumns = this.columnsDescription.map(colDesc => colDesc.id);
    this.users = new Map<string, User>();
    this.shareUser = new Map<number, User>();
  }

  ngOnInit(): void {
    this.dataSource = new ShareDataSource(this.sessionService, this.shareService, this.mode);
    this.dataSource.loadData(this.sort, this.filter);
    this.dataSource.connect().pipe(
        flatMap(sha => sha),
        filter(share => ! Array.from(this.users.keys()).includes(share.targetUserId + '@' + share.targetUserSource)),
        concatMap(share =>
            combineLatest(
                of(share),
                this.administrationService.getManageableUser(this.sessionService.sessionToken, share.targetUserId, share.targetUserSource)
            )
        ),
        tap( ([share, user]) => this.users.set(user.uid + '@' + user.source, user)),
        tap( ([share, user]) => this.shareUser.set(share.id, user)),
    ).subscribe();
  }

  sortData($event: Sort): void {
    this.sort.name = $event.active;
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    if ((sortTypeMapping)[this.sort.name] != null) {
      this.sort.type = sortTypeMapping[this.sort.name];
    }
    if (this.sort.name === 'with') {
      const data = new Map<number, string>();
      this.shareUser.forEach((user, id) => data.set(id, user.lastName + ', ' + user.firstName));
      this.sort.externalSortData = data;
    } else {
      this.sort.externalSortData = null;
    }
    this.dataSource.loadData(
        this.sort,
        null
    );
  }

  endShare(id: number): void {

  }

  retrieveDocumentIcon(element: DMEntity, iconPrefix: string): string {
    return DMEntityUtils.retrieveEntityIconName(this.iconService, element, iconPrefix);
  }

  retrieveUserName(userId: string, userSource: string): Observable<string> {
    return this.administrationService.getManageableUser(this.sessionService.sessionToken, userId, userSource).pipe(
        map(user => user.name)
    );
  }
}
