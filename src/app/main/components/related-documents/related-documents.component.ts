import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {Document as KimiosDocument, DocumentService} from 'app/kimios-client-api';
import {concatMap, filter, tap} from 'rxjs/operators';
import {DEFAULT_DISPLAYED_COLUMNS, KimiosDocumentDataSource} from 'app/main/model/kimios-document-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {DocumentDetailService} from 'app/services/document-detail.service';

const sortTypeMapping = {
  'name': 'string',
  'documentTypeName': 'string',
  'owner': 'string',
  'creationDate': 'number'
};

@Component({
  selector: 'related-documents',
  templateUrl: './related-documents.component.html',
  styleUrls: ['./related-documents.component.scss']
})
export class RelatedDocumentsComponent implements OnInit {

  @Input()
  documentId: number;
  documentId$: BehaviorSubject<number>;
  relatedDocuments: Array<KimiosDocument>;
  dataSource: KimiosDocumentDataSource;
  columnsDescription = DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns: Array<string>;
  sort = <DMEntitySort> {
    name: 'name',
    direction: 'asc',
    type: 'string'
  };

  constructor(
      private sessionService: SessionService,
      private documentService: DocumentService,
      private router: Router,
      private documentDetailService: DocumentDetailService
  ) {
    this.displayedColumns = this.columnsDescription.map(elem => elem.id);
    this.documentId$ = new BehaviorSubject<number>(null);
  }

  ngOnInit(): void {
    this.dataSource = new KimiosDocumentDataSource();
    this.documentId$.pipe(
      filter(docId => docId != null),
      concatMap(docId => this.documentService.getRelatedDocuments(this.sessionService.sessionToken, docId)),
      tap(docs => this.relatedDocuments = docs),
      tap(docs => this.dataSource.setData(docs))
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
    const unsortedData = this.dataSource.connect().getValue();
    const sortType = sortTypeMapping[this.sort.name] ? sortTypeMapping[this.sort.name] : 'string';
    const sort = this.sort;
    const sortedData = unsortedData.sort((elem1, elem2) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      const cmp = sortType === 'number' ?
          compareNumbers([elem1[sort.name]], [elem2[sort.name]]) :
          elem1[sort.name].localeCompare(elem2[sort.name]);
      console.log(dir + ' ' + cmp + ' ' + elem1[sort.name] + ' ' + elem2[sort.name] + ' ' + sortType);
      return dir * cmp;
    });
    this.dataSource.setData(sortedData);
  }

  add(): void {

  }

  deleteRow(i: any, $event: MouseEvent): void {

  }

  goToDocument($event: MouseEvent, uid: number, colId: string): void {
    if (colId !== 'actionRemove') {
      DocumentUtils.navigateToFile(this.router, uid);
    }
  }
}
