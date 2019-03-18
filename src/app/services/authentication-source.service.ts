import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConfig} from './app.config.service';
import {catchError, tap} from 'rxjs/operators';
import {AuthenticationSource} from '../main/pages/authentication/login/login.component';


@Injectable({
    providedIn: 'root'
})
export class AuthenticationSourceService {

    constructor(
        private http: HttpClient,
        private config: AppConfig
    ) { }

    retrieveAuthenticationSources(): AuthenticationSource[] {
        return [
            { value: 'uh', viewValue: 'view uh'},
            { value: 'ah', viewValue: 'view ah'},
        ];
/*        return this.http.get(
            this.config.getConfig('kimiosUrl') + '/security/getAuthenticationSources'
        );*/
    }
}
