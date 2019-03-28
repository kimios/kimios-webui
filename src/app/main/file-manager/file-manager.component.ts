import {Component, OnInit} from '@angular/core';
import {Sort} from '@angular/material';
import {Document, Folder, Workspace} from 'app/kimios-client-api';
import {of} from 'rxjs';
import {EntityService} from 'app/services/entity.service';
import 'rxjs/add/operator/mergeMap';

const DEFAULT_PATH = 'WORKSPACE_DEFAULT/FOLDER_DEFAULT';

@Component({
    selector: 'app-file-manager',
    templateUrl: './file-manager.component.html',
    styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
    private _folderUsed: Folder;
    private workspaceUsed: Workspace;
    private filesPath: string = DEFAULT_PATH;

    displayedColumns: string[] = [];
    dataSource: Document[];
    columnsDescription: ColumnDescription[] = DEFAULT_DISPLAYED_COLUMNS;

    constructor(
        private entityService: EntityService,
    ) {

        this.columnsDescription.forEach( (elem) => {
            this.displayedColumns.push(elem.matHeaderCellDef);
        });
    }

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
            .mergeMap(
                (array) => of(array.filter(
                    (elem) => elem.name === pathTab[0]
                ).shift())
            )
            .mergeMap(
                (workspace) => {
                    this.workspaceUsed = workspace;
                    return this.entityService.retrieveFolders(workspace);
                }
            )
            .mergeMap(
                (folders) => {
                    const f = folders.filter(
                        (elem) => elem.name === pathTab[1]
                    ).shift();
                    this.folderUsed = f;
                    return of(f);
                }
            )
            .mergeMap(
                (folder) => this.entityService.retrieveFolderFiles(folder)
            )
            .mergeMap(
                (docs) => this.dataSource = docs
            )
            .subscribe();
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
