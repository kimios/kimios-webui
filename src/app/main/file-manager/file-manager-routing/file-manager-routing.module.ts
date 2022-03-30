import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FileSearchPanelComponent} from 'app/main/components/file-search-panel/file-search-panel.component';
import {LoggedInGuard} from 'app/logged-in.guard';
import {SearchEntityService} from 'app/services/searchentity.service';
import {FileDetailComponent} from 'app/main/components/file-detail/file-detail.component';
import {BrowseComponent} from 'app/main/components/browse/browse.component';
import {FileManagerComponent} from '../file-manager.component';
import {MyBookmarksComponent} from 'app/main/components/my-bookmarks/my-bookmarks.component';
import {SharesComponent} from 'app/main/components/shares/shares.component';
import {SearchQueriesComponent} from 'app/main/components/search-queries/search-queries.component';
import {SettingsComponent} from 'app/main/components/settings/settings.component';
import {OverviewComponent} from 'app/main/components/overview/overview.component';
import {WorkspacesComponent} from 'app/main/components/workspaces/workspaces.component';
import {CartContentComponent} from 'app/main/components/cart-content/cart-content.component';
import {FilePreviewWrapperComponent} from 'app/main/components/file-preview-wrapper/file-preview-wrapper.component';
import {FileDetailDataAndTagsComponent} from 'app/main/components/file-detail-data-and-tags/file-detail-data-and-tags.component';
import {DocumentMetaDataComponent} from 'app/main/components/document-meta-data/document-meta-data.component';
import {DocumentVersionsComponent} from 'app/main/components/document-versions/document-versions.component';
import {RelatedDocumentsComponent} from 'app/main/components/related-documents/related-documents.component';
import {FileSecurityComponent} from 'app/main/components/file-security/file-security.component';
import {FileHistoryComponent} from 'app/main/components/file-history/file-history.component';

const fileManagerRoutes: Routes = [
    {
        path: '',
        component: FileManagerComponent,
        canActivate: [ LoggedInGuard ],
        children: [
            {
                path: '',
                redirectTo: '/workspaces',
                pathMatch: 'full'
            },
            {
                path: 'doc/:documentId',
                component: FileDetailComponent,
                canActivate: [ LoggedInGuard ]
            }
        ]
    },
  {
    path: 'search',
    component: FileSearchPanelComponent,
    canActivate: [ LoggedInGuard ],
    resolve  : {
      files: SearchEntityService
    }
  },
  {
    path: 'document/:documentId',
    component: FileDetailComponent,
    canActivate: [LoggedInGuard],
    children: [
      {
        path: '',
        redirectTo: 'preview',
        pathMatch: 'full'
      },
      {
        path: 'preview',
        component: FilePreviewWrapperComponent
      },
      {
        path: 'data',
        component: FileDetailDataAndTagsComponent
      },
      {
        path: 'metadata',
        component: DocumentMetaDataComponent
      },
      {
        path: 'version',
        component: DocumentVersionsComponent
      },
      {
        path: 'related',
        component: RelatedDocumentsComponent
      },
      {
        path: 'security',
        component: FileSecurityComponent
      },
      {
        path: 'history',
        component: FileHistoryComponent
      }
    ]
  },
  {
    path: 'browse',
    component: BrowseComponent,
    canActivate: [ LoggedInGuard ],
    /*resolve: {
      files: BrowseService
    }*/
  },
    {
        path: 'browse/:entityId',
        component: BrowseComponent,
        canActivate: [ LoggedInGuard ],
        /*resolve: {
          files: BrowseService
        }*/
    },
    {
        path: 'workspaces',
        component: WorkspacesComponent,
        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'workspaces/:entityId',
        component: WorkspacesComponent,
        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'mybookmarks',
        component: MyBookmarksComponent,
        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'shares',
        component: SharesComponent,
        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'searchqueries/:docNameSearch',
        component: SearchQueriesComponent,
        canActivate: [ LoggedInGuard ]
    },
    {
      path: 'searchqueries',
      component: SearchQueriesComponent,
      canActivate: [ LoggedInGuard ]
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'overview',
        component: OverviewComponent,
        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'cart',
        component: CartContentComponent,
        canActivate: [ LoggedInGuard ]
    }

];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(fileManagerRoutes)
  ],
  exports: [
      RouterModule
  ]
})
export class FileManagerRoutingModule { }
