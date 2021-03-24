import {ColumnDescription} from 'app/main/model/column-description';
import {MatTableDataSource} from '@angular/material';
import {BehaviorSubject} from 'rxjs';
import {DocumentVersionService, Meta} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {MetaUtils} from 'app/main/utils/meta-utils';
import {MetaDataTypeMapping} from 'app/main/model/meta-data-type.enum';

export const METAS_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'name',
        matColumnDef: 'name',
        position: 1,
        matHeaderCellDef: 'name',
        sticky: false,
        displayName: 'name',
        cell: null
    },
    {
        id: 'type',
        matColumnDef: 'type',
        position: 2,
        matHeaderCellDef: 'type',
        sticky: false,
        displayName: 'type',
        cell: (meta) => MetaDataTypeMapping[meta.metaType]
    }, {
        id: 'mandatory',
        matColumnDef: 'mandatory',
        position: 3,
        matHeaderCellDef: 'mandatory',
        sticky: false,
        displayName: 'mandatory',
        cell: null
    }
];

export class MetaDataSource extends MatTableDataSource<Meta> {
    private dataSubject = new BehaviorSubject<Meta[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(
        private sessionService: SessionService,
        private documentVersionService: DocumentVersionService
    ) {
        super();
    }

    connect(): BehaviorSubject<Meta[]> {
        return this.dataSubject;
    }

    disconnect(): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(docTypeUid: number): void {
        this.documentVersionService.getUnheritedMetas(this.sessionService.sessionToken, docTypeUid).subscribe(
            metas => this.dataSubject.next(metas)
        );
    }

    sortData1(sort: DMEntitySort): void {
        this.dataSubject.next(this.dataSubject.getValue().sort((meta1, meta2) =>
            sort.direction === 'desc' ?
                -1 * MetaUtils.compareMetas(meta1, meta2, sort.name) :
                MetaUtils.compareMetas(meta1, meta2, sort.name)
        ));
    }
}
