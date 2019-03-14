import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './main/pages/home/home.component';
import { LoginComponent } from './main/pages/authentication/login/login.component';
import { SampleComponent} from './main/sample/sample.component';

import { LoggedInGuard } from './logged-in.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full' ,
        canActivate: [ LoggedInGuard ]
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
