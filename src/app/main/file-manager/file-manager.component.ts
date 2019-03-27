import {Component, OnInit} from '@angular/core';
import {Sort} from '@angular/material';
import {Document, Folder, Workspace} from 'app/kimios-client-api';
import {Observable, of, throwError} from 'rxjs';
import {EntityService} from 'app/services/entity.service';
import {catchError} from 'rxjs/operators';

const DEFAULT_PATH = 'boumboumboum/mika';

@Component({
    selector: 'app-file-manager',
    templateUrl: './file-manager.component.html',
    styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
    private _folderUsed: Folder;
    public workspaceUsed: Workspace;

    constructor(
        private entityService: EntityService,
    ) {

        this.columnsDescription.forEach((elem) => {
            this.displayedColumns.push(elem.matHeaderCellDef);
        });
    }

    private filesPath: string = DEFAULT_PATH;

    displayedColumns: string[] = [];
    dataSource: Document[];

    tables = [0];

    columnsDescription: ColumnDescription[] = DEFAULT_DISPLAYED_COLUMNS;

    set folderUsed(value: Folder) {
        this._folderUsed = value;
    }

    get folderUsed(): Folder {
        return this._folderUsed;
    }

    static compare(a: number | string, b: number | string, isAsc: boolean): number {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    ngOnInit(): void {
        const pathTab = this.filesPath.split('/');

        this.entityService.retrieveUserWorkspaces()
            .map(
                (array) => array.filter(
                    (elem) => elem.name === pathTab[0]
                ).shift()
            )
            .subscribe(
                (workspace) => {
                    this.workspaceUsed = workspace;
                }
            );

        this.entityService.retrieveEntity('/' + DEFAULT_PATH)
            .pipe(
                catchError((err) => throwError(err))
            )
            .subscribe(
                (folder) => this._folderUsed = folder,
                (error) => console.log('error', error),
                () => console.log('folder not find: ' + pathTab[1])
            );
    }

    sortData(sort: Sort): number {
        if (this.dataSource === null) {
            return;
        }
        const data = this.dataSource.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSource = data;
            return;
        }
        this.dataSource = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            return FileManagerComponent.compare(a[sort.active], b[sort.active], isAsc);
        });
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
