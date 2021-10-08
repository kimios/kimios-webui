import {Component, Input, OnInit} from '@angular/core';
import {DocumentVersion} from 'app/kimios-client-api';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {filter, tap} from 'rxjs/operators';
import {Sort} from '@angular/material';
import {ColumnDescription} from 'app/main/model/column-description';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {DocumentVersionDataSource} from './document-version-data-source';

const sortTypeMapping = {
      'uid': 'number',
      'documentTypeName': 'string',
      'length': 'number',
      'author': 'string',
      'creationDate': 'number',
      'modificationDate': 'number',
      'customVersion': 'string'
};

@Component({
  selector: 'document-versions',
  templateUrl: './document-versions.component.html',
  styleUrls: ['./document-versions.component.scss']
})
export class DocumentVersionsComponent implements OnInit {

  @Input()
  versionList: Array<DocumentVersion>;

  currentVersionId = 0;
  dataSource: DocumentVersionDataSource;
  columnsDescription = VERSIONS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns: Array<string>;
  sort = <DMEntitySort> {
    name: 'uid',
    direction: 'desc',
    type: 'number'
  };

  constructor(
      private documentDetailService: DocumentDetailService
  ) {
    this.displayedColumns = this.columnsDescription.map(elem => elem.id);
  }

  ngOnInit(): void {
    this.dataSource = new DocumentVersionDataSource();
    this.dataSource.setData(this.versionList);

    this.documentDetailService.currentVersionId.pipe(
        filter(currentVersionId => currentVersionId != null),
        tap(currentVersionId => this.currentVersionId = currentVersionId)
    ).subscribe();
  }

  handleVersionDownload(versionId: number): void {
    this.documentDetailService.downloadDocumentVersion(versionId);
  }

  handleVersionPreview(uid: number): void {
    this.documentDetailService.currentVersionId.next(uid);
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
}

export const VERSIONS_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
  {
    id: 'uid',
    matColumnDef: 'uid',
    position: 1,
    matHeaderCellDef: 'uid',
    sticky: false,
    displayName: '#id',
    cell: (row: DocumentVersion) => row.uid
  },
  {
    id: 'documentTypeName',
    matColumnDef: 'documentTypeName',
    position: 2,
    matHeaderCellDef: 'documentTypeName',
    sticky: false,
    displayName: 'Document type',
    cell: (row: DocumentVersion) => row.documentTypeName
  },
  {
    id: 'length',
    matColumnDef: 'length',
    position: 3,
    matHeaderCellDef: 'length',
    sticky: false,
    displayName: 'Size',
    cell: (row: DocumentVersion) => row.length
  },
  {
    id: 'author',
    matColumnDef: 'author',
    position: 4,
    matHeaderCellDef: 'author',
    sticky: false,
    displayName: 'Author',
    cell: (row: DocumentVersion) => row.author + '@' + row.authorSource
  },
  {
    id: 'creationDate',
    matColumnDef: 'creationDate',
    position: 5,
    matHeaderCellDef: 'creationDate',
    sticky: false,
    displayName: 'Creation date',
    cell: (row: DocumentVersion) => row.creationDate
  },
  {
    id: 'modificationDate',
    matColumnDef: 'modificationDate',
    position: 6,
    matHeaderCellDef: 'modificationDate',
    sticky: false,
    displayName: 'Modification date',
    cell: (row: DocumentVersion) => row.modificationDate
  },
  {
    id: 'customVersion',
    matColumnDef: 'customVersion',
    position: 7,
    matHeaderCellDef: 'customVersion',
    sticky: false,
    displayName: 'Custom version',
    cell: (row: DocumentVersion) => row.customVersion
  }
];
