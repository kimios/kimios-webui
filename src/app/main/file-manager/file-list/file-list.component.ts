import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {fuseAnimations} from '@fuse/animations';
import {FuseSidebarService} from '@fuse/components/sidebar/sidebar.service';
import {MatDialog, MatSort} from '@angular/material';
import {SearchEntityService} from 'app/services/searchentity.service';
import {FileDetailDialogComponent} from 'app/main/components/file-detail-dialog/file-detail-dialog.component';
import {ColumnDescription} from 'app/main/model/column-description';
import {Router} from '@angular/router';
import {DEFAULT_DISPLAYED_COLUMNS, FilesDataSource} from 'app/main/file-manager/file-data-source';

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

    /**
     * Constructor
     *
     * @param {FileManagerService} _fileManagerService
     * @param {FuseSidebarService} _fuseSidebarService
     */
    constructor(
        private _fileManagerService: SearchEntityService,
        private _fuseSidebarService: FuseSidebarService,
        public dialog: MatDialog,
        private router: Router
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
    }

    ngAfterViewInit(): void {
        // reset the paginator after sorting
        this.sort.sortChange
            .pipe(
                tap(() => this.dataSource.loadDocuments(this.sort.active, this.sort.direction, 0))
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
        // this.openDocumentDetailDialog(selected.uid);
        this.navigateToSelectedFile(selected.uid);
    }

    private navigateToSelectedFile(id: number): void {
        this.router.navigate(['/document', id]);
    }

    openDocumentDetailDialog(uid: number): void {
        const dialogRef = this.dialog.open(FileDetailDialogComponent, {
            data: { 'uid': uid }
        });
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
