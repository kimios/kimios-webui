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
    MatProgressSpinnerModule,
    MatRadioModule,
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
import {FileSearchPanelComponent} from 'app/main/components/file-search-panel/file-search-panel.component';
import {FileManagerRoutingModule} from 'app/main/file-manager/file-manager-routing/file-manager-routing.module';
import {FileDetailDataComponent} from 'app/main/components/file-detail-data/file-detail-data.component';
import {UsersGroupsSearchPanelComponent} from 'app/main/components/users-groups-search-panel/users-groups-search-panel.component';
import {UsersAndGroupsSelectionPanelComponent} from 'app/main/components/users-and-groups-selection-panel/users-and-groups-selection-panel.component';
import {UsersAndGroupsSelectionDialogComponent} from 'app/main/components/users-and-groups-selection-dialog/users-and-groups-selection-dialog.component';
import {FilePreviewComponent} from 'app/main/components/file-preview/file-preview.component';


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
        FileTagsComponent,
        FileSearchPanelComponent,
        FileDetailDataComponent,
        UsersGroupsSearchPanelComponent,
        UsersAndGroupsSelectionPanelComponent,
        UsersAndGroupsSelectionDialogComponent,
        FilePreviewComponent
    ],
    imports: [
        FileManagerRoutingModule,
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
        ShareDialogComponent,
        UsersAndGroupsSelectionDialogComponent
    ],
    exports: [
        FileUploadListComponent,
        FileUploadProgressComponent,
        ShareFormComponent
    ]
})
export class FileManagerModule { }
