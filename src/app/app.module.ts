import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatButtonModule, MatIconModule} from '@angular/material';
// import { MatOptionModule } from '@angular/material';
// import { MatSelectModule } from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import 'hammerjs';

import {FuseModule} from '@fuse/fuse.module';
import {FuseSharedModule} from '@fuse/shared.module';
import {FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule} from '@fuse/components';

import {fuseConfig} from 'app/fuse-config';
// import { FakeDbService } from 'app/fake-db/fake-db.service';
import {AppComponent} from 'app/app.component';
// import { AppStoreModule } from 'app/store/store.module';
import {LayoutModule} from 'app/layout/layout.module';
import {SampleModule} from 'app/main/sample/sample.module';
import {LoginModule} from 'app/main/pages/authentication/login/login.module';

import {LoggedInGuard} from 'app/logged-in.guard';
import {HomeComponent} from './main/pages/home/home.component';
import {UserService} from './user.service';
import {AppRoutingModule} from './app-routing.module';
import {AppConfig} from './services/app.config.service';
import {ApiModule as KimiosApiModule} from 'app/kimios-client-api/api.module';
import {BASE_PATH} from 'app/kimios-client-api/variables';
import {APP_CONFIG} from './app-config/config';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,

        TranslateModule.forRoot(),
        /*InMemoryWebApiModule.forRoot(FakeDbService, {
            delay             : 0,
            passThruUnknownUrl: true
        }),*/

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,
        // MatOptionModule,
        // MatSelectModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        // App modules
        LayoutModule,
        SampleModule,
        LoginModule,
        KimiosApiModule
    ],
    bootstrap   : [
        AppComponent
    ],
    providers: [
        UserService,
        LoggedInGuard,
        AppConfig,
        {
            provide: APP_INITIALIZER,
            useFactory: (config: AppConfig) => () => { config.load(APP_CONFIG); }, deps: [AppConfig], multi: true
        },
        {
            provide: BASE_PATH,
            useValue: APP_CONFIG.KIMIOS_API_BASE_PATH
        }
    ]
})
export class AppModule
{
}
