import {ColumnDescription} from 'app/main/model/column-description';
import {Bookmark, DocumentService, Share} from 'app/kimios-client-api';
import {BehaviorSubject} from 'rxjs';
import {SessionService} from 'app/services/session.service';
import {tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {DMEntitySortSubElement} from 'app/main/model/dmentity-sort-sub-element';

export const BOOKMARKS_DEFAULT_DISPLAYED_COLUMNS: ColumnDescription[] = [
    {
        id: 'name',
        matColumnDef: 'name',
        position: 1,
        matHeaderCellDef: 'name',
        sticky: false,
        displayName: 'Document name',
        cell: (row: Bookmark) => row.entity.name
    }, {
        id: 'path',
        matColumnDef: 'path',
        position: 2,
        matHeaderCellDef: 'path',
        sticky: false,
        displayName: 'Document path',
        cell: (row: Share) => row.entity.path
    }/*, {
        id: 'entity',
        matColumnDef: 'entity',
        position: 3,
        matHeaderCellDef: 'entity',
        sticky: false,
        displayName: 'Document',
        cell: (row: Share) => row.entity.name,
        title: (row: Share) => row.entity.path
            + '/'
            + row.entity.name
    }*/
];

export class BookmarksDataSource extends MatTableDataSource<Bookmark> {
    private bookmarksSubject = new BehaviorSubject<Bookmark[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(
        private sessionService: SessionService,
        private documentService: DocumentService
    ) {
        super();
    }

    connect(): BehaviorSubject<Bookmark[]> {
        return this.bookmarksSubject;
    }

    disconnect(): void {
        this.bookmarksSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(sort: DMEntitySortSubElement, filter: string): void {
        this.documentService.getBookmarks(this.sessionService.sessionToken).pipe(
            tap(bookmarks => this.bookmarksSubject.next(this._sortData(bookmarks, sort)))
        ).subscribe();
    }

    private _sortData(data: Array<Bookmark>, sort: DMEntitySortSubElement): Array<Bookmark> {
        return data.sort((bookmark1, bookmarks2) => this._compareDataOnField(bookmark1, bookmarks2, sort));
    }

    private _compareDataOnField(element1: Bookmark, element2: Bookmark, sort: DMEntitySortSubElement): number {
        const sortDir = sort.direction === 'asc' ?
            1 :
            -1;
        const sortRes = sortDir * (
            sort.type != null ?
                sort.type === 'number' ?
                    compareNumbers([element1[sort.subElement][sort.name]], [element2[sort.subElement][sort.name]]) :
                    sort.type === 'DMEntity' ?
                        element1[sort.subElement][sort.name].name.localeCompare(element2[sort.subElement][sort.name].name) :
                        element1[sort.subElement][sort.name].localeCompare(element2[sort.subElement][sort.name]) :
                element1[sort.subElement][sort.name].localeCompare(element2[sort.subElement][sort.name])
        );

        return sortRes;
    }
}
