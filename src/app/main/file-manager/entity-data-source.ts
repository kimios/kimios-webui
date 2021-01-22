import {DMEntity, Document} from 'app/kimios-client-api';
import {DataSource} from '@angular/cdk/table';
import {CollectionViewer} from '@angular/cdk/collections';
import {BehaviorSubject, Observable} from 'rxjs';
import {ColumnDescription} from 'app/main/model/column-description';
import * as moment from 'moment';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

export class EntityDataSource extends DataSource<DMEntity> {

    private _entities$: BehaviorSubject<Array<DMEntity>>;

    constructor(
    ) {
        super();
        this._entities$ = new BehaviorSubject<Array<DMEntity>>([]);
    }

    static humanFileSize(bytes, si): string {
        const thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        const units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
    }

    connect(collectionViewer: CollectionViewer): Observable<DMEntity[] | ReadonlyArray<DMEntity>> {
        return this._entities$;
    }

    disconnect(collectionViewer: CollectionViewer): void {
    }

    setData(data: Array<DMEntity>): void {
        this._entities$.next(data);
    }
}

export const DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
   /* {
        id: 'icon',
        matColumnDef: 'entityType',
        position: 1,
        matHeaderCellDef: 'entityType',
        sticky: false,
        displayName: '',
        cell: (row: Document) => `${
            DMEntityUtils.dmEntityIsDocument(row) ? 'document' : 'folder'
        }`
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
    /*{
        id: 'documentTypeName',
        matColumnDef: 'documentTypeName',
        position: 2,
        matHeaderCellDef: 'documentTypeName',
        sticky: false,
        displayName: 'Type',
        cell: (row: Document) => `${
            DMEntityUtils.dmEntityIsDocument(row) ? 'document' :
                DMEntityUtils.dmEntityIsFolder(row) ? 'folder' :
                    'workspace'
        }`
    },*/
    {
        id: 'versionUpdateDate',
        matColumnDef: 'versionUpdateDate',
        position: 3,
        matHeaderCellDef: 'versionUpdateDate',
        sticky: false,
        displayName: 'Last Update',
        cell: (row: Document) => `${ moment(row.updateDate).fromNow() }`
    },
    /*{
        id: 'length',
        matColumnDef: 'length',
        position: 4,
        matHeaderCellDef: 'length',
        sticky: false,
        displayName: 'Size',
        cell: (row: any) => `${ 
            DMEntityUtils.dmEntityIsDocument(row) ? 
                EntityDataSource.humanFileSize(row.length, 1024) :
                '-'
        }`
    },*/
    {
        id: 'extension',
        matColumnDef: 'extension',
        position: 5,
        matHeaderCellDef: 'extension',
        sticky: false,
        displayName: 'File Type',
        cell: (row: Document) => `${
            DMEntityUtils.dmEntityIsDocument(row) ? 
                row.extension != null && row.extension !== undefined ? 
                    row.extension :
                    'unknown' :
                '-'
        }`
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
