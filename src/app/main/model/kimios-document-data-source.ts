import {BehaviorSubject} from 'rxjs';
import {ColumnDescription} from 'app/main/model/column-description';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {MatTableDataSource} from '@angular/material';
import {ColumnDescriptionWithElement} from './column-description-with-element';

export class KimiosDocumentDataSource extends MatTableDataSource<KimiosDocument> {
    private documentsSubject = new BehaviorSubject<KimiosDocument[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();
    public totalNbElements$: BehaviorSubject<number>;

    constructor() {
        super();
        this.totalNbElements$ = new BehaviorSubject<number>(0);
    }

    connect(): BehaviorSubject<KimiosDocument[]> {
        return this.documentsSubject;
    }

    disconnect(): void {
        this.documentsSubject.complete();
        this.loadingSubject.complete();
    }

    setData(data: Array<KimiosDocument>): void {
        this.documentsSubject.next(data);
    }
}

export const DEFAULT_DISPLAYED_COLUMNS: Array<ColumnDescriptionWithElement | ColumnDescription> = [
    {
        // to delete this row
        id: 'actionRemove',
        matColumnDef: 'actionRemove',
        position: 1,
        matHeaderCellDef: 'actionRemove',
        sticky: false,
        displayName: '',
        cell: 'remove',
        element: 'iconName',
        class: 'mat-column-width50',
        noSortHeader: true,
        cellHeaderIcon: 'add_circle'
    },
    {
        id: 'name',
        matColumnDef: 'name',
        position: 2,
        matHeaderCellDef: 'name',
        sticky: false,
        displayName: 'Name',
        cell: (row: KimiosDocument) => `${ row.name + (row.extension ? '.' + row.extension : '') }`
    },
    {
        id: 'documentTypeName',
        matColumnDef: 'documentTypeName',
        position: 3,
        matHeaderCellDef: 'documentTypeName',
        sticky: false,
        displayName: 'Document type',
        cell: (row: KimiosDocument) => `${ (row.documentTypeName ? row.documentTypeName : '-') }`
    },
    /*{
        id: 'versionUpdateDate',
        matColumnDef: 'versionUpdateDate',
        position: 3,
        matHeaderCellDef: 'versionUpdateDate',
        sticky: false,
        displayName: 'Last Update',
        cell: null
    },*/
    {
        id: 'creationDate',
        matColumnDef: 'creationDate',
        position: 4,
        matHeaderCellDef: 'creationDate',
        sticky: false,
        displayName: 'Creation Date',
        cell: null
    },
    {
        id: 'owner',
        matColumnDef: 'owner',
        position: 5,
        matHeaderCellDef: 'owner',
        sticky: false,
        displayName: 'Owner',
        cell: null
    },
    /*{
        id: 'lastVersionId',
        matColumnDef: 'lastVersionId',
        position: 6,
        matHeaderCellDef: 'lastVersionId',
        sticky: false,
        displayName: 'Version Id'
    }*/
];
