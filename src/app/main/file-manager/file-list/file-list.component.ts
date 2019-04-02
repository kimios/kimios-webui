import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, Subject } from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { EntityService } from 'app/services/entity.service';
import {MatSort} from '@angular/material';
import {Document} from '../../../kimios-client-api';
import * as moment from 'moment';
import {SearchEntityService} from '../../../services/searchentity.service';



@Component({
    selector     : 'file-list',
    templateUrl  : './file-list.component.html',
    styleUrls    : ['./file-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FileManagerFileListComponent implements OnInit, OnDestroy, AfterViewInit
{
    files: any;
    dataSource: FilesDataSource | null;
    // displayedColumns = ['icon', 'name', 'type', 'owner', 'size', 'modified', 'detail-button'];
    displayedColumns = [];
    columnsDescription: ColumnDescription[] = DEFAULT_DISPLAYED_COLUMNS;
    selected: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    @ViewChild(MatSort) sort: MatSort;



    static humanFileSize(bytes, si): string {
        var thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
    }


    /**
     * Constructor
     *
     * @param {FileManagerService} _fileManagerService
     * @param {FuseSidebarService} _fuseSidebarService
     */
    constructor(
        private _fileManagerService: SearchEntityService,
        private _fuseSidebarService: FuseSidebarService

    )
    {

        this.columnsDescription.forEach((elem) => {
            this.displayedColumns.push(elem.matHeaderCellDef);
        });
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.dataSource = new FilesDataSource(this._fileManagerService);

        this._fileManagerService.onFilesChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(files => {
                this.files = files;
            });

        this._fileManagerService.onFileSelected
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(selected => {
                this.selected = selected;
            });
    }

    ngAfterViewInit(): void {
        // reset the paginator after sorting
        this.sort.sortChange
            .pipe(
                tap(() => this.dataSource.loadDocuments(this.sort.active, this.sort.direction, 0, 25 , "*"))
            )
            .subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On select
     *
     * @param selected
     */
    onSelect(selected): void
    {
        this._fileManagerService.onFileSelected.next(selected);
    }



    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void
    {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
}

export class FilesDataSource extends DataSource<any>
{
    /**
     * Constructor
     *
     * @param {FileManagerService} _fileManagerService
     */
    constructor(
        private _fileManagerService: SearchEntityService
    )
    {
        super();
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        return this._fileManagerService.onFilesChanged;
    }

    /**
     * Disconnect
     */
    disconnect(): void
    {
    }

    loadDocuments(sortField: string, sortDir, page: number, pageSize: number, query: string): void {
        this._fileManagerService.getFiles(sortField, sortDir, page, pageSize, query);
    }
}


export interface ColumnDescription {
    matColumnDef: string;
    id: string;
    position: number;
    matHeaderCellDef: string;
    displayName: string;
    sticky: boolean;
    cell: any;
}

const DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    /*{
        id: 'icon',
        matColumnDef: 'icon',
        position: 0,
        matHeaderCellDef: 'icon',
        sticky: false,
        displayName: '',
        cell: null
    },*/
    {
        id: 'name',
        matColumnDef: 'name',
        position: 1,
        matHeaderCellDef: 'name',
        sticky: false,
        displayName: 'Name',
        cell: null
    },
    {
        id: 'documentTypeName',
        matColumnDef: 'documentTypeName',
        position: 2,
        matHeaderCellDef: 'documentTypeName',
        sticky: false,
        displayName: 'Type',
        cell: null
    },
    {
        id: 'versionUpdateDate',
        matColumnDef: 'versionUpdateDate',
        position: 3,
        matHeaderCellDef: 'versionUpdateDate',
        sticky: false,
        displayName: 'Last Update',
        cell: (row: Document) => `${ moment(row.updateDate).fromNow() }`
    },
    {
        id: 'length',
        matColumnDef: 'length',
        position: 4,
        matHeaderCellDef: 'length',
        sticky: false,
        displayName: 'Size',
        cell: (row: any) => `${ FileManagerFileListComponent.humanFileSize(row.length, 1024) }`
    },
    {
        id: 'extension',
        matColumnDef: 'extension',
        position: 5,
        matHeaderCellDef: 'extension',
        sticky: false,
        displayName: 'File Type',
        cell: null
    }
    /*{
        id: 'creationDate',
        matColumnDef: 'creationDate',
        position: 4,
        matHeaderCellDef: 'creationDate',
        sticky: false,
        displayName: 'Creation Date'
    },
    {
        id: 'owner',
        matColumnDef: 'owner',
        position: 5,
        matHeaderCellDef: 'owner',
        sticky: false,
        displayName: 'Owner'
    },
    {
        id: 'lastVersionId',
        matColumnDef: 'lastVersionId',
        position: 6,
        matHeaderCellDef: 'lastVersionId',
        sticky: false,
        displayName: 'Version Id'
    }*/
];
