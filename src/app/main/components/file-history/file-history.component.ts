import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {Log, LogService} from 'app/kimios-client-api';
import {BehaviorSubject, Observable} from 'rxjs';
import {LOG_DEFAULT_DISPLAYED_COLUMNS, LogDataSource} from './log-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';
import {filter, tap} from 'rxjs/operators';
import {DocumentDetailService} from 'app/services/document-detail.service';

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
  documentId$: BehaviorSubject<number>;
  logList$: Observable<Array<Log>>;
  dataSource: LogDataSource;
  sort: DMEntitySort = { name: 'date', direction: 'desc' };
  columnsDescription = LOG_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = ['date', 'author', 'operation'];

  constructor(
      private sessionService: SessionService,
      private logService: LogService,
      private documentDetailService: DocumentDetailService
  ) {
    this.sort = <DMEntitySort> {
      name: 'date',
      direction: 'desc',
      type: 'number'
    };
    this.dataSource = new LogDataSource(sessionService, logService);
    this.documentId$ = new BehaviorSubject<number>(null);
  }

  ngOnInit(): void {
    this.documentId$.pipe(
      filter(docId => docId != null),
      tap(docId => this.dataSource.loadLogs(docId, this.sort))
    ).subscribe();

    if (this.documentId == null) {
      this.documentDetailService.currentDocumentId$.pipe(
        filter(docId => docId != null),
        tap(docId => this.documentId = docId),
        tap(docId => this.documentId$.next(docId))
      ).subscribe();
    } else {
      this.documentId$.next(this.documentId);
    }
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
