import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { hmrBootstrap } from 'hmr';

import { AppComponent } from './app/app.component';
import { UserService } from './app/user.service';
import { LoggedInGuard } from './app/logged-in.guard';
import { appRoutes } from './app/app.module';

if ( environment.production )
{
    enableProdMode();
}

@NgModule({
    bootstrap: [AppComponent],
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        HttpClientModule
    ],
    providers: [UserService, LoggedInGuard]
})
class MainModule {}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if ( environment.hmr )
{
    if ( module['hot'] )
    {
        hmrBootstrap(module, bootstrap);
    }
    else
    {
        console.error('HMR is not enabled for webpack-dev-server!');
        console.log('Are you using the --hmr flag for ng serve?');
    }
}
else
{
    bootstrap().catch(err => console.log(err));
}
