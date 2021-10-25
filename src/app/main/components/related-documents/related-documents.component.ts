import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {Document as KimiosDocument, DocumentService} from 'app/kimios-client-api';
import {tap} from 'rxjs/operators';
import {DEFAULT_DISPLAYED_COLUMNS, KimiosDocumentDataSource} from 'app/main/model/kimios-document-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';

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
  documentUid: number;
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
      private documentService: DocumentService
  ) {
    this.displayedColumns = this.columnsDescription.map(elem => elem.id);
  }

  ngOnInit(): void {
    this.dataSource = new KimiosDocumentDataSource();
    this.documentService.getRelatedDocuments(this.sessionService.sessionToken, this.documentUid).pipe(
        tap(docs => this.relatedDocuments = docs),
        tap(docs => this.dataSource.setData(docs))
    ).subscribe();
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
}
