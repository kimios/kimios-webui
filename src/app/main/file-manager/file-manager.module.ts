import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileManagerComponent} from './file-manager.component';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
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
    MatMenuModule,
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
    MatTreeModule
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
import {BrowseTreeComponent} from 'app/main/components/browse-tree/browse-tree.component';
import {DocumentMenuComponent} from 'app/main/components/document-menu/document-menu.component';
import {DocumentLinkComponent} from 'app/main/components/document-link/document-link.component';
import {ContainerEntityComponent} from 'app/main/components/container-entity/container-entity.component';
import {ContainerEntityDataComponent} from 'app/main/components/container-entity-data/container-entity-data.component';
import {ContainerEntityDialogComponent} from 'app/main/components/container-entity-dialog/container-entity-dialog.component';
import {WorkspacesComponent} from 'app/main/components/workspaces/workspaces.component';
import {MyBookmarksComponent} from 'app/main/components/my-bookmarks/my-bookmarks.component';
import {SharesComponent} from 'app/main/components/shares/shares.component';
import {SearchQueriesComponent} from 'app/main/components/search-queries/search-queries.component';
import {SettingsComponent} from 'app/main/components/settings/settings.component';
import {OverviewComponent} from 'app/main/components/overview/overview.component';
import {BrowseListComponent} from 'app/main/components/browse-list/browse-list.component';
import {EntityListLockButtonComponent} from 'app/main/components/entity-list-lock-button/entity-list-lock-button.component';
import {FilePermissionsComponent} from 'app/main/components/file-permissions/file-permissions.component';
import {FilePermissionsDialogComponent} from 'app/main/components/file-permissions-dialog/file-permissions-dialog.component';
import {PermissionsUsersGroupsAddComponent} from 'app/main/components/permissions-users-groups-add/permissions-users-groups-add.component';
import {WindowRef} from '@agm/core/utils/browser-globals';
import {ShareExternalComponent} from 'app/main/components/share-external/share-external.component';
import {AdministrationComponent} from 'app/main/components/administration/administration.component';
import {StudioComponent} from 'app/main/components/studio/studio.component';
import {PersonalSettingsComponent} from 'app/main/components/personal-settings/personal-settings.component';
import {AdminDomainsComponent} from 'app/main/components/admin-domains/admin-domains.component';
import {AdminSpecialRolesComponent} from 'app/main/components/admin-special-roles/admin-special-roles.component';
import {AdminSpecialTasksComponent} from 'app/main/components/admin-special-tasks/admin-special-tasks.component';
import {AdminDomainsParametersComponent} from 'app/main/components/admin-domains-parameters/admin-domains-parameters.component';
import {AdminDomainsUsersComponent} from 'app/main/components/admin-domains-users/admin-domains-users.component';
import {AdminDomainsGroupsComponent} from 'app/main/components/admin-domains-groups/admin-domains-groups.component';
import {UserDialogComponent} from 'app/main/components/user-dialog/user-dialog.component';
import {UserFormComponent} from 'app/main/components/user-form/user-form.component';
import {GroupDialogComponent} from 'app/main/components/group-dialog/group-dialog.component';
import {GroupFormComponent} from 'app/main/components/group-form/group-form.component';
import {AdminSpecialRolesAddToRoleDialogComponent} from 'app/main/components/admin-special-roles-add-to-role-dialog/admin-special-roles-add-to-role-dialog.component';
import {AdminSpecialTasksSessionsComponent} from 'app/main/components/admin-special-tasks-sessions/admin-special-tasks-sessions.component';
import {AdminSpecialTasksReindexComponent} from 'app/main/components/admin-special-tasks-reindex/admin-special-tasks-reindex.component';
import {AdTaskComponent} from 'app/main/components/ad-task/ad-task.component';
import {AdDirective} from './ad-directive';
import {ErrorDialogComponent} from 'app/main/components/error-dialog/error-dialog.component';
import {SharesListComponent} from 'app/main/components/shares-list/shares-list.component';
import {WorkspaceMenuComponent} from 'app/main/components/workspace-menu/workspace-menu.component';
import {NotificationCenterComponent} from 'app/main/components/notification-center/notification-center.component';
import {NotificationCenterListComponent} from 'app/main/components/notification-center-list/notification-center-list.component';
import {DocumentUploadProgressComponent} from 'app/main/components/document-upload-progress/document-upload-progress.component';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {StudioDocumentTypesComponent} from 'app/main/components/studio-document-types/studio-document-types.component';
import {StudioDocumentTypeAdminComponent} from 'app/main/components/studio-document-type-admin/studio-document-type-admin.component';


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
        ContainerEntityCreationDialogComponent,
        BrowseTreeComponent,
        DocumentMenuComponent,
        DocumentLinkComponent,
        ContainerEntityComponent,
        ContainerEntityDataComponent,
        ContainerEntityDialogComponent,
        WorkspacesComponent,
        MyBookmarksComponent,
        SharesComponent,
        SearchQueriesComponent,
        SettingsComponent,
        OverviewComponent,
        BrowseListComponent,
        EntityListLockButtonComponent,
        FilePermissionsComponent,
        FilePermissionsDialogComponent,
        PermissionsUsersGroupsAddComponent,
        ShareExternalComponent,
        AdministrationComponent,
        StudioComponent,
        PersonalSettingsComponent,
        AdminDomainsComponent,
        AdminSpecialRolesComponent,
        AdminSpecialTasksComponent,
        AdminDomainsParametersComponent,
        AdminDomainsUsersComponent,
        AdminDomainsGroupsComponent,
        UserDialogComponent,
        UserFormComponent,
        GroupDialogComponent,
        GroupFormComponent,
        AdminSpecialRolesAddToRoleDialogComponent,
        AdminSpecialTasksSessionsComponent,
        AdminSpecialTasksReindexComponent,
        AdTaskComponent,
        AdDirective,
        ErrorDialogComponent,
        SharesListComponent,
        WorkspaceMenuComponent,
        NotificationCenterComponent,
        NotificationCenterListComponent,
        DocumentUploadProgressComponent,
        ConfirmDialogComponent,
        StudioDocumentTypesComponent,
        StudioDocumentTypeAdminComponent
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
        MatButtonToggleModule,

        DragDropModule,
        MatGridListModule,

        TreeModule.forRoot()
    ],
    providers   : [
        EntityService,
        SearchEntityService,
        WindowRef
    ],
    entryComponents: [
        FilesUploadDialogComponent,
        FileDetailDialogComponent,
        ShareDialogComponent,
        UsersAndGroupsSelectionDialogComponent,
        EntityMoveDialogComponent,
        ContainerEntityCreationDialogComponent,
        ContainerEntityDialogComponent,
        FilePermissionsDialogComponent,
        UserDialogComponent,
        GroupDialogComponent,
        AdminSpecialRolesAddToRoleDialogComponent,
        AdminSpecialTasksReindexComponent,
        AdminSpecialTasksSessionsComponent,
        ErrorDialogComponent,
        DocumentUploadProgressComponent,
        ConfirmDialogComponent
    ],
    exports: [
        FileUploadListComponent,
        FileUploadProgressComponent,
        ShareFormComponent,
        BrowseGridComponent,
        ContainerEntityComponent,
        NotificationCenterComponent
    ]
})
export class FileManagerModule { }
