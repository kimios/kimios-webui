import {ColumnDescription} from 'app/main/model/column-description';
import {MatTableDataSource} from '@angular/material';
import {BehaviorSubject} from 'rxjs';
import {DMEntitySort} from 'app/main/model/dmentity-sort';

export const META_FEED_VALUES_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'name',
        matColumnDef: 'name',
        position: 1,
        matHeaderCellDef: 'name',
        sticky: false,
        displayName: 'name',
        cell: null
    }
];

export class MetaFeedValuesDataSource extends MatTableDataSource<string> {
    private dataSubject = new BehaviorSubject<Array<string>>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor() {
        super();
    }

    connect(): BehaviorSubject<Array<string>> {
        return this.dataSubject;
    }

    disconnect(): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    setData(array: Array<string>): void {
        this.dataSubject.next(array);
    }

    sortData1(sort: DMEntitySort): void {
        this.dataSubject.next(this.dataSubject.getValue().sort((a, b) => a.localeCompare(b)));
    }
}
