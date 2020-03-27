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
    MatGridListModule,
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
    MatTabsModule,
    MatTreeModule,
    MatMenuModule
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
import {BrowseComponent} from 'app/main/components/browse/browse.component';
import {BrowseGridComponent} from 'app/main/components/browse-grid/browse-grid.component';
import {EntityGridTileComponent} from 'app/main/components/entity-grid-tile/entity-grid-tile.component';
import {EntityListingComponent} from 'app/main/components/entity-listing/entity-listing.component';
import {TreeModule} from 'angular-tree-component';
import {KimiosNavBarComponent} from 'app/main/components/kimios-nav-bar/kimios-nav-bar.component';
import {BrowsePathComponent} from 'app/main/components/browse-path/browse-path.component';
import {EntityMoveDialogComponent} from 'app/main/components/entity-move-dialog/entity-move-dialog.component';
import {BrowseTreeMenuComponent} from 'app/main/components/browse-tree-menu/browse-tree-menu.component';
import {ContainerEntityCreationDialogComponent} from 'app/main/components/container-entity-creation-dialog/container-entity-creation-dialog.component';


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
        FilePreviewComponent,
        BrowseComponent,
        BrowseGridComponent,
        EntityGridTileComponent,
        EntityListingComponent,
        KimiosNavBarComponent,
        BrowsePathComponent,
        EntityMoveDialogComponent,
        BrowseTreeMenuComponent,
        ContainerEntityCreationDialogComponent
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
        MatTreeModule,
        MatMenuModule,

        DragDropModule,
        MatGridListModule,

        TreeModule.forRoot()
    ],
    providers   : [
        EntityService,
        SearchEntityService
    ],
    entryComponents: [
        FilesUploadDialogComponent,
        FileDetailDialogComponent,
        ShareDialogComponent,
        UsersAndGroupsSelectionDialogComponent,
        EntityMoveDialogComponent,
        ContainerEntityCreationDialogComponent
    ],
    exports: [
        FileUploadListComponent,
        FileUploadProgressComponent,
        ShareFormComponent,
        BrowseGridComponent
    ]
})
export class FileManagerModule { }
