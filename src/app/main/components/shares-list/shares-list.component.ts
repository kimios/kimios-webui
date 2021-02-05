import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {ShareService} from 'app/kimios-client-api';
import {ShareDataSource, SHARES_DEFAULT_DISPLAYED_COLUMNS} from './share-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';

export enum SharesListMode {
  WITH_ME = 'withMe',
  BY_ME = 'byMe'
}

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

  constructor(
      private sessionService: SessionService,
      private shareService: ShareService,
  ) {
    this.sort = <DMEntitySort> {
      name: 'creationDate',
      direction: 'desc',
      type: 'number'
    };
    this.displayedColumns = this.columnsDescription.map(colDesc => colDesc.id);
  }

  ngOnInit(): void {
    this.dataSource = new ShareDataSource(this.sessionService, this.shareService, this.mode);
    this.dataSource.loadData(this.sort, this.filter);
  }

  sortData($event: Sort): void {

  }

  endShare(id: number): void {

  }
}
