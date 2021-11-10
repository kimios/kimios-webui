import {Component, Input, OnInit} from '@angular/core';
import {DocumentVersion} from 'app/kimios-client-api';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {concatMap, filter, map, tap} from 'rxjs/operators';
import {MatDialog, Sort} from '@angular/material';
import {ColumnDescription} from 'app/main/model/column-description';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {DocumentVersionDataSource} from './document-version-data-source';
import {BehaviorSubject, Observable} from 'rxjs';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {DocumentVersionDataDialogComponent} from 'app/main/components/document-version-data-dialog/document-version-data-dialog.component';
import {ColumnDescriptionWithElement} from 'app/main/model/column-description-with-element';

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
  documentId: number;
  documentId$: BehaviorSubject<number>;
  versionList: Array<DocumentVersion>;
  versionList$: Observable<Array<DocumentVersion>>;

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
      private documentDetailService: DocumentDetailService,
      private entityCacheService: EntityCacheService,
      public dialog: MatDialog
  ) {
    this.displayedColumns = this.columnsDescription.map(elem => elem.id);
    this.versionList = new Array<DocumentVersion>();
    this.documentId$ = new BehaviorSubject<number>(null);
  }

  ngOnInit(): void {
    this.dataSource = new DocumentVersionDataSource();
    this.versionList$ = this.documentId$.pipe(
      filter(docId => docId != null),
      concatMap(docId => this.entityCacheService.findDocumentVersionsInCache(docId)),
      map(versionWithMetaDataValuesList => versionWithMetaDataValuesList
        .map(v => v.documentVersion)),
      tap(versionList => this.dataSource.setData(versionList)),
    );

    this.documentDetailService.currentVersionId.pipe(
        filter(currentVersionId => currentVersionId != null),
        tap(currentVersionId => this.currentVersionId = currentVersionId)
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

  showVersionData(documentVersion: DocumentVersion): void {
    // show dialog with version data
    this.dialog.open(DocumentVersionDataDialogComponent, {
      data: {
        documentVersion: documentVersion
      }
    });
  }
}

export const VERSIONS_DEFAULT_DISPLAYED_COLUMNS: Array<ColumnDescriptionWithElement | ColumnDescription> = [
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
  },
  {
    // to delete this row
    id: 'actionOpenDetails',
    matColumnDef: 'actionOpenDetails',
    position: 1,
    matHeaderCellDef: 'actionOpenDetails',
    sticky: false,
    displayName: '',
    cell: 'visibility',
    element: 'iconName',
    class: 'mat-column-width50',
    noSortHeader: true,
    cellHeaderIcon: ''
  }
];
