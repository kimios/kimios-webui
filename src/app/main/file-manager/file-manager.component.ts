import {Component, OnInit, ViewChild} from '@angular/core';
import {MatButtonToggleGroup, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Document, DocumentService, FolderService, WorkspaceService} from 'app/kimios-client-api';
import {SessionService} from '../../services/session.service';

const DEFAULT_PATH = 'WORKSPACE_DEFAULT/FOLDER_DEFAULT';

@Component({
    selector: 'app-file-manager',
    templateUrl: './file-manager.component.html',
    styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
    private filesPath: string = DEFAULT_PATH;

    displayedColumns: string[] = [];
    dataSource: DocumentInterface[] = ELEMENT_DATA;

    tables = [0];

    columnsDescription: ColumnDescription[] = DEFAULT_DISPLAYED_COLUMNS;

    constructor(
        private sessionService: SessionService,

    ) {

        this.columnsDescription.forEach( (elem) => {
            this.displayedColumns.push(elem.matHeaderCellDef);
        });
    }

    ngOnInit(): void {

        // this.entityService

    }
}

export interface DocumentInterface {
    name: string;
    documentTypeName: string;
    mimeType: string;
    updateDate: Date;
    creationDate: Date;
    owner: string;
    lastVersionId: string;
}

const ELEMENT_DATA: DocumentInterface[] = [
    {name: 'Hydrogen', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Helium', documentTypeName: 'doc type 2', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Helium', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Beryllium', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Boron', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Carbon', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Carbon', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Carbon', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Fluorine', documentTypeName: 'doc type 3', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Neon', documentTypeName: 'doc type 3', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 3', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 5', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 09', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'},
    {name: 'Hydrogen', documentTypeName: 'doc type 1', mimeType: 'mime type', updateDate: new Date(), creationDate: new Date(), owner: 'You', lastVersionId: '0.0.1'}

];

export interface ColumnDescription {
    matColumnDef: string;
    id: string;
    position: number;
    matHeaderCellDef: string;
    sticky: boolean;
}

const DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'name',
        matColumnDef: 'name',
        position: 0,
        matHeaderCellDef: 'name',
        sticky: true
    },
    {
        id: 'documentTypeName',
        matColumnDef: 'documentTypeName',
        position: 1,
        matHeaderCellDef: 'documentTypeName',
        sticky: false
    },
    {
        id: 'mimeType',
        matColumnDef: 'mimeType',
        position: 2,
        matHeaderCellDef: 'mimeType',
        sticky: false
    },
    {
        id: 'updateDate',
        matColumnDef: 'updateDate',
        position: 3,
        matHeaderCellDef: 'updateDate',
        sticky: false
    },
    {
        id: 'creationDate',
        matColumnDef: 'creationDate',
        position: 4,
        matHeaderCellDef: 'creationDate',
        sticky: false
    },
    {
        id: 'owner',
        matColumnDef: 'owner',
        position: 5,
        matHeaderCellDef: 'owner',
        sticky: false
    },
    {
        id: 'lastVersionId',
        matColumnDef: 'lastVersionId',
        position: 6,
        matHeaderCellDef: 'lastVersionId',
        sticky: false
    }
];
