import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileManagerComponent} from './file-manager.component';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule, MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule
} from '@angular/material';

import {FuseSharedModule} from '@fuse/shared.module';
import {FuseSearchBarModule, FuseSidebarModule} from '@fuse/components';


import {EntityService} from 'app/services/entity.service';
import {FileManagerDetailsSidebarComponent} from 'app/main/file-manager/sidebars/details/details.component';
import {FileManagerFileListComponent} from 'app/main/file-manager/file-list/file-list.component';
import {FileManagerMainSidebarComponent} from 'app/main/file-manager/sidebars/main/main.component';
import {SearchEntityService} from 'app/services/searchentity.service';
import {FilesUploadDialogComponent} from 'app/main/components/files-upload-dialog/files-upload-dialog.component';
import {FileSearchBarComponent} from 'app/main/components/file-search-bar/file-search-bar.component';
import {FileUploadListComponent} from 'app/main/components/file-upload-list/file-upload-list.component';
import {FileUploadProgressComponent} from 'app/main/components/file-upload-progress/file-upload-progress.component';
import {FileDetailDialogComponent} from 'app/main/components/file-detail-dialog/file-detail-dialog.component';
import {FileDetailComponent} from 'app/main/components/file-detail/file-detail.component';
import {FileToolbarComponent} from 'app/main/components/file-toolbar/file-toolbar.component';
import {FileSecurityComponent} from 'app/main/components/file-security/file-security.component';
import {ShareFormComponent} from 'app/main/components/share-form/share-form.component';
import {ShareDialogComponent} from 'app/main/components/share-dialog/share-dialog.component';
import {FileTagsComponent} from 'app/main/components/file-tags/file-tags.component';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
    declarations: [
        FileManagerComponent,
        FileManagerFileListComponent,
        FileManagerMainSidebarComponent,
        FileManagerDetailsSidebarComponent,
        FilesUploadDialogComponent,
        FileSearchBarComponent,
        FileUploadListComponent,
        FileUploadProgressComponent,
        FileDetailComponent,
        FileDetailDialogComponent,
        FileToolbarComponent,
        FileSecurityComponent,
        ShareFormComponent,
        ShareDialogComponent,
        FileTagsComponent
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
        MatProgressBarModule,
        MatListModule,
        MatTabsModule,
        MatDatepickerModule,
        MatSelectModule,
        MatRadioModule,

        FuseSharedModule,
        FuseSidebarModule,
        MatInputModule,
        MatFormFieldModule,
        FuseSearchBarModule,
        MatExpansionModule,
        MatProgressSpinnerModule,

        DragDropModule
    ],
    providers   : [
        EntityService,
        SearchEntityService
    ],
    entryComponents: [
        FilesUploadDialogComponent,
        FileDetailDialogComponent,
        ShareDialogComponent
    ],
    exports: [
        FileUploadListComponent,
        FileUploadProgressComponent,
        ShareFormComponent
    ]
})
export class FileManagerModule { }
