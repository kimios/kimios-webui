import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatOptionModule } from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';

import { LoginComponent } from 'app/main/pages/authentication/login/login.component';
import {SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';

const routes = [
    {
        path     : 'auth/login',
        component: LoginComponent
    }
];

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,

        FuseSharedModule
    ],
    exports: [
        LoginComponent
    ],
    providers: [
        SecurityService,
        SessionService
    ]
})
export class LoginModule
{
}
