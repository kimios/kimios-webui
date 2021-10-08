import {MatTableDataSource} from '@angular/material';
import {DocumentVersion} from 'app/kimios-client-api';
import {BehaviorSubject} from 'rxjs';

export class DocumentVersionDataSource extends MatTableDataSource<DocumentVersion>{
    private documentVersionsSubject = new BehaviorSubject<DocumentVersion[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();
    public totalNbElements$: BehaviorSubject<number>;

    constructor(
    ) {
        super();
        this.totalNbElements$ = new BehaviorSubject<number>(0);
    }

    connect(): BehaviorSubject<DocumentVersion[]> {
        return this.documentVersionsSubject;
    }

    disconnect(): void {
        this.documentVersionsSubject.complete();
        this.loadingSubject.complete();
    }

    setData(data: Array<DocumentVersion>): void {
        this.documentVersionsSubject.next(data);
    }
}
