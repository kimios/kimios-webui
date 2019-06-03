import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileManagerComponent} from './file-manager.component';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule, MatChipsModule,
    MatDialogModule, MatDividerModule, MatExpansionModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatPaginatorModule,
    MatRippleModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule
} from '@angular/material';

import {FuseSharedModule} from '@fuse/shared.module';
import {FuseSearchBarModule, FuseSidebarModule} from '@fuse/components';


import {EntityService} from 'app/services/entity.service';
import {FileManagerDetailsSidebarComponent} from 'app/main/file-manager/sidebars/details/details.component';
import {FileManagerFileListComponent} from 'app/main/file-manager/file-list/file-list.component';
import {FileManagerMainSidebarComponent} from 'app/main/file-manager/sidebars/main/main.component';
import {SearchEntityService} from 'app/services/searchentity.service';
import {FilesUploadDialogComponent} from 'app/main/components/files-upload-dialog/files-upload-dialog.component';
import {FileSearchComponent} from 'app/main/components/file-search/file-search.component';
import {FileUploadListComponent} from 'app/main/components/file-upload-list/file-upload-list.component';
import {FileUploadProgressComponent} from '../components/file-upload-progress/file-upload-progress.component';


@NgModule({
    declarations: [
        FileManagerComponent,
        FileManagerFileListComponent,
        FileManagerMainSidebarComponent,
        FileManagerDetailsSidebarComponent,
        FilesUploadDialogComponent,
        FileSearchComponent,
        FileUploadListComponent,
        FileUploadProgressComponent
    ],
    imports: [

        MatButtonModule,
        MatIconModule,
        MatRippleModule,
        MatSlideToggleModule,
        MatTableModule,
        CommonModule,
        MatSortModule,
        MatCheckboxModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatPaginatorModule,
        MatDividerModule,

        FuseSharedModule,
        FuseSidebarModule,
        MatInputModule,
        MatFormFieldModule,
        FuseSearchBarModule,
        MatExpansionModule
    ],
    providers   : [
        EntityService,
        SearchEntityService
    ],
    entryComponents: [
        FilesUploadDialogComponent
    ],
    exports: [
        FileUploadListComponent,
        FileUploadProgressComponent
    ]
})
export class FileManagerModule { }
