import {Injectable, OnDestroy} from '@angular/core';
import {SecurityService, User} from 'app/kimios-client-api';
import {CookieService} from 'ngx-cookie-service';
import {Observable} from 'rxjs';

const KIMIOS_COOKIE = 'kimios';

@Injectable({
    providedIn: 'root'
})
export class SessionService implements OnDestroy {
    private _sessionToken: string = null;
    private _sessionAlive: boolean;
    private intervalId: number;

    constructor(
        private securityService: SecurityService,
        private cookieService: CookieService
    ) {
        this.intervalId = window.setInterval(
            () => this.setSessionAlive(),
            5000
        );
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }

    get sessionToken(): string {
        return this._sessionToken ? this._sessionToken : this.cookieService.get(KIMIOS_COOKIE);
    }

    set sessionToken(value: string) {
        this._sessionToken = value;
        this.cookieService.set(KIMIOS_COOKIE, value);
    }

    setSessionAlive(): void {
        this.securityService.isSessionAlive(this.sessionToken)
            .subscribe(
                res => this._sessionAlive = res,
                error => this._sessionAlive = error.error.text
            );
    }

    get sessionAlive(): boolean {
        return this._sessionAlive;
    }

    set sessionAlive(alive: boolean) {
        this._sessionAlive = alive;
    }

    retrieveUserData(): Observable<User> {
        return this.securityService.getUser(this.sessionToken);
    }

    logout(): Observable<string> {
        return this.securityService.endSession(this.sessionToken);
    }
}
