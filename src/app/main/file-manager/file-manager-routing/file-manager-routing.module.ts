import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FileSearchPanelComponent} from 'app/main/components/file-search-panel/file-search-panel.component';
import {LoggedInGuard} from 'app/logged-in.guard';
import {SearchEntityService} from 'app/services/searchentity.service';
import {FileDetailComponent} from 'app/main/components/file-detail/file-detail.component';
import {BrowseComponent} from 'app/main/components/browse/browse.component';

const fileManagerRoutes: Routes = [
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
