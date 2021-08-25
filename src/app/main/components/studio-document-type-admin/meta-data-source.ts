import {ColumnDescription} from 'app/main/model/column-description';
import {MatTableDataSource} from '@angular/material';
import {BehaviorSubject} from 'rxjs';
import {DocumentVersionService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {MetaUtils} from 'app/main/utils/meta-utils';
import {MetaDataTypeMapping} from 'app/main/model/meta-data-type.enum';
import {MetaWithMetaFeedImpl} from 'app/main/model/meta-with-meta-feed';

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
    },
    {
        id: 'metafeed',
        matColumnDef: 'metafeed',
        position: 3,
        matHeaderCellDef: 'metafeed',
        sticky: false,
        displayName: 'meta feed',
        cell: null
    }, {
        id: 'mandatory',
        matColumnDef: 'mandatory',
        position: 4,
        matHeaderCellDef: 'mandatory',
        sticky: false,
        displayName: 'mandatory',
        cell: null
    }
];

export class MetaDataSource extends MatTableDataSource<MetaWithMetaFeedImpl> {
    private dataSubject = new BehaviorSubject<MetaWithMetaFeedImpl[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(
        private sessionService: SessionService,
        private documentVersionService: DocumentVersionService
    ) {
        super();
    }

    connect(): BehaviorSubject<MetaWithMetaFeedImpl[]> {
        return this.dataSubject;
    }

    disconnect(): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(docTypeUid: number): void {
        this.documentVersionService.getUnheritedMetas(this.sessionService.sessionToken, docTypeUid).subscribe(
            metas => this.dataSubject.next(metas.map(meta => MetaWithMetaFeedImpl.fromMeta(meta)))
        );
    }

    setData(metas: Array<MetaWithMetaFeedImpl>): void {
        this.dataSubject.next(metas);
    }

    sortData1(sort: DMEntitySort): void {
        this.dataSubject.next(this.dataSubject.getValue().sort((meta1, meta2) =>
            sort.direction === 'desc' ?
                -1 * MetaUtils.compareMetas(meta1, meta2, sort.name) :
                MetaUtils.compareMetas(meta1, meta2, sort.name)
        ));
    }
}
