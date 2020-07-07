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

const fileManagerRoutes: Routes = [
    {
        path: '',
        component: FileManagerComponent,
        canActivate: [ LoggedInGuard ],
        children: [
            {
                path: '',
                component: BrowseComponent,
                canActivate: [ LoggedInGuard ]
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
    canActivate: [ LoggedInGuard ]
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
