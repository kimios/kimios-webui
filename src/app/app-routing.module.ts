import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './main/pages/authentication/login/login.component';
import {SampleComponent} from './main/sample/sample.component';

import {LoggedInGuard} from './logged-in.guard';
import {FileManagerComponent} from './main/file-manager/file-manager.component';
import {FileDetailComponent} from './main/components/file-detail/file-detail.component';

export const routes: Routes = [
    {
        path: '',
        component: FileManagerComponent,
        pathMatch: 'full' ,
        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'files/:id',
        component: FileDetailComponent,
        pathMatch: 'full' ,
//        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'files',
        redirectTo: '',
        pathMatch: 'full' ,
//        canActivate: [ LoggedInGuard ]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'sample',
        component: SampleComponent,
        canActivate: [ LoggedInGuard ]
    },
    {
        path      : '**',
        redirectTo: ''
    }
];
@NgModule({
  imports: [RouterModule.forRoot(routes,
    { enableTracing: true }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
