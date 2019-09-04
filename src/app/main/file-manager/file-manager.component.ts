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

export const DEFAULT_PATH = 'ng_workspace/root_folder';


@Component({
    selector: 'app-file-manager',
    templateUrl: './file-manager.component.html',
    styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {

    constructor() {
    }

    ngOnInit(): void {
    }


}



