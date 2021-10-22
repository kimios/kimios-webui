import {BehaviorSubject} from 'rxjs';
import {ColumnDescription} from 'app/main/model/column-description';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {MatTableDataSource} from '@angular/material';

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

export const DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'name',
        matColumnDef: 'name',
        position: 1,
        matHeaderCellDef: 'name',
        sticky: false,
        displayName: 'Name',
        cell: (row: KimiosDocument) => `${ row.name + (row.extension ? '.' + row.extension : '') }`
    },
    {
        id: 'documentTypeName',
        matColumnDef: 'documentTypeName',
        position: 2,
        matHeaderCellDef: 'documentTypeName',
        sticky: false,
        displayName: 'Document type',
        cell: null
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
