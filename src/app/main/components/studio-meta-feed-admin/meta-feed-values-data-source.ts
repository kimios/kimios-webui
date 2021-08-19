import {ColumnDescription} from 'app/main/model/column-description';
import {MatTableDataSource} from '@angular/material';
import {BehaviorSubject} from 'rxjs';
import {DMEntitySort} from 'app/main/model/dmentity-sort';

export interface MetaFeedValue {
    value: string;
    id: number;
}

export const META_FEED_VALUES_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'value',
        matColumnDef: 'value',
        position: 1,
        matHeaderCellDef: 'value',
        sticky: false,
        displayName: 'Value',
        cell: null
    }
];

export class MetaFeedValuesDataSource extends MatTableDataSource<MetaFeedValue> {
    private dataSubject = new BehaviorSubject<Array<MetaFeedValue>>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor() {
        super();
    }

    connect(): BehaviorSubject<Array<MetaFeedValue>> {
        return this.dataSubject;
    }

    disconnect(): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    setData(array: Array<MetaFeedValue>): void {
        this.dataSubject.next(array);
    }

    sortData1(sort: DMEntitySort): void {
        this.dataSubject.next(this.dataSubject.getValue().sort((a, b) => a.value.localeCompare(b.value)));
    }
}
