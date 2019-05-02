import {Component, OnInit} from '@angular/core';
import {Folder, Workspace} from 'app/kimios-client-api';
import {Observable, of} from 'rxjs';
import {FileUploadService} from 'app/services/file-upload.service';
import {isNumeric} from 'rxjs/internal-compatibility';
import {SearchEntityService} from 'app/services/searchentity.service';

const DEFAULT_PATH = 'boumboumboum/mika';


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
    error: string;

    constructor(
        private fileUploadService: FileUploadService,
        private searchEntityService: SearchEntityService
    ) {

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

    }

    onSubmitFileUpload(): void {
        const formData = new FormData();
        formData.append('file', this.fileToUpload);
    }

    handleFileInput(files: FileList): void {
        this.fileToUpload = files.item(0);

        this.fileUploadService.uploadFile(
            this.fileToUpload,
            this.filesPath + '/' + this.fileToUpload.name,
            true,
            '[]',
            true,
            -1,
            '[]'
        ).subscribe(
            (res) => {
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
            },
            (err) => this.error = err,
            () => this.searchEntityService.reloadFiles()

        );
    }
}



