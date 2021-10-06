import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {Log, LogService} from 'app/kimios-client-api';
import {Observable} from 'rxjs';
import {LOG_DEFAULT_DISPLAYED_COLUMNS, LogDataSource} from './log-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';

const sortTypeMapping = {
  'date' : 'number',
  'author' : 'string',
  'operation' : 'number'
};

@Component({
  selector: 'file-history',
  templateUrl: './file-history.component.html',
  styleUrls: ['./file-history.component.scss']
})
export class FileHistoryComponent implements OnInit {

  @Input()
  documentId: number;
  logList$: Observable<Array<Log>>;
  dataSource: LogDataSource;
  sort: DMEntitySort = { name: 'date', direction: 'desc' };
  columnsDescription = LOG_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = ['date', 'author', 'operation'];

  constructor(
      private sessionService: SessionService,
      private logService: LogService
  ) {
    this.sort = <DMEntitySort> {
      name: 'date',
      direction: 'desc',
      type: 'number'
    };
    this.dataSource = new LogDataSource(sessionService, logService);
  }

  ngOnInit(): void {
    this.dataSource.loadLogs(this.documentId, this.sort);
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
    this.dataSource.sortLoadedData(this.sort);
  }

}
