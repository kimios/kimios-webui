import {Component, OnInit} from '@angular/core';
import {Sort} from '@angular/material';
import {Document, Folder, Workspace} from 'app/kimios-client-api';
import {of} from 'rxjs';
import {EntityService} from 'app/services/entity.service';
import 'rxjs/add/operator/mergeMap';

const DEFAULT_PATH = 'boumboumboum/mika';


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

    constructor(

    ) {

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

    }
}



