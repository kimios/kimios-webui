import {Component, OnInit} from '@angular/core';
import {Folder, Workspace} from 'app/kimios-client-api';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {FileUploadService} from 'app/services/file-upload.service';
import {isNumeric} from 'rxjs/internal-compatibility';
import {PAGE_SIZE_DEFAULT, SearchEntityService} from 'app/services/searchentity.service';
import {FilesUploadDialogComponent} from 'app/main/components/files-upload-dialog/files-upload-dialog.component';
import {MatDialog, PageEvent} from '@angular/material';
import {catchError} from 'rxjs/operators';
import {isNumber} from 'util';
import {Tag} from 'app/main/model/tag';

const DEFAULT_PATH = 'ng_workspace/root_folder';


@Component({
    selector: 'app-file-manager',
    templateUrl: './file-manager.component.html',
    styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
    private _folderUsed: Folder;
    private workspaceUsed: Workspace;
    private filesPath: string = DEFAULT_PATH;

    displayedColumns: string[] = [];
    fileToUpload: File = null;
    lastUploadedDocId: Observable<number> = null;
    uploadResponse = { status: '', message: '' };
    totalFilesFound$: BehaviorSubject<number>;

    pageSize: number;
    pageIndex: number;
    pageSizeOptions = [5, 10, 20];

    constructor(
        private fileUploadService: FileUploadService,
        private searchEntityService: SearchEntityService,
        public filesUploadDialog: MatDialog
    ) {
        this.totalFilesFound$ = new BehaviorSubject<number>(undefined);
        this.pageSize = PAGE_SIZE_DEFAULT;
    }

    set folderUsed(value: Folder) {
        this._folderUsed = value;
    }

    get folderUsed(): Folder {
        return this._folderUsed;
    }

    static compare(a: number | string, b: number | string, isAsc: boolean): number {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    ngOnInit(): void {
        const pathTab = this.filesPath.split('/');
        this.searchEntityService.onTotalFilesChanged.subscribe(
            res => this.totalFilesFound$.next(isNumber(res) ? res : undefined)
        );
        this.searchEntityService.onSortChanged.subscribe(
            res => this.pageIndex = 0
        );
    }

    onSubmitFileUpload(): void {
        const formData = new FormData();
        formData.append('file', this.fileToUpload);
    }

    handleFileInput(files: FileList): void {
        this.fileToUpload = files.item(0);

        this.fileUploadService.uploadFile(
            null,
            this.fileToUpload,
            this.filesPath + '/' + this.fileToUpload.name,
            true,
            '[]',
            true,
            -1,
            '[]'
        ).subscribe(
            (res) => {
                this.handleUploadProgress(res);
            },
            null,
            () => this.searchEntityService.reloadFiles()

        );
    }

    handleUploadProgress(res: { name: string, status: string, message: number } | number | string | {}): void {
        if (res instanceof Object
            && res.hasOwnProperty('status')
            && res.hasOwnProperty('message')) {
            this.uploadResponse = {
                status: res['status'],
                message: '' + res['message']
            };
            console.log('uploadResponse: ');
            console.log(this.uploadResponse);
        } else if (isNumeric(res)) {
            console.log('HttpResponse: ' + res);
        } else {
            console.log(res);
        }
    }

    handleDrop(event: Event): void {
        event.preventDefault();

        if (event['dataTransfer'] != null
            && event['dataTransfer']['files'] != null) {
            Array.from(event['dataTransfer']['files']).forEach(file => console.log(file));
            this.openFilesUploadDialog(event['dataTransfer']['files']);
        }
    }

    handleDragOver(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
    }

    openFilesUploadDialog(list: FileList): void {
        const dialogRef = this.filesUploadDialog.open(FilesUploadDialogComponent, {
            // width: '250px',
            data: {
                filesList: Array.from(list),
                filesTags: new Map<string, Map<number, Tag>>()
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (! result) {
                return;
            }
            console.log('The dialog was closed');
            console.dir(dialogRef.componentInstance.data.filesList);

            this.fileUploadService.uploadFiles(dialogRef.componentInstance.data.filesList.map(v => [
                v,
                this.filesPath + '/' + v.name,
                true,
                '[]',
                true,
                -1,
                '[]',
                dialogRef.componentInstance.data.filesTags.get(v.name) ?
                    Array.from(dialogRef.componentInstance.data.filesTags.get(v.name).keys()) :
                    []
            ]))
                .pipe(
                    catchError(error => {
                        console.log('server error: ');
                        console.dir(error);
                        return of({ name: 'filename', status: 'error', message: (error.error && error.error.message) ? error.error.message : '' });
                    })
                )
                .subscribe(
                    null,
                    null,
                    () => this.searchEntityService.reloadFiles()
                );
        });
    }

    paginatorHandler($event: PageEvent): void {
        this.searchEntityService.changePage($event.pageIndex, $event.pageSize);
        this.pageIndex = $event.pageIndex;
        this.pageSize = $event.pageSize;
    }
}



