import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileManagerComponent} from './file-manager.component';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule, MatExpansionModule, MatFormFieldModule,
    MatIconModule, MatInputModule,
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
import {SearchEntityService} from '../../services/searchentity.service';
import {FilesUploadDialogComponent} from '../components/files-upload-dialog/files-upload-dialog.component';
import {FileSearchComponent} from '../components/file-search/file-search.component';


@NgModule({
    declarations: [
        FileManagerComponent,
        FileManagerFileListComponent,
        FileManagerMainSidebarComponent,
        FileManagerDetailsSidebarComponent,
        FilesUploadDialogComponent,
        FileSearchComponent
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
    ]
})
export class FileManagerModule { }
