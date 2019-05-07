import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {SecurityService, User} from 'app/kimios-client-api';
import {CookieService} from 'ngx-cookie-service';
import {Observable, of, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {catchError} from 'rxjs/operators';

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
        private cookieService: CookieService,
        private router: Router,
        public _zone: NgZone
    ) {
        // if sessionToken is read from cookie, we temporarily consider session alive
        if (this.sessionToken) {
            this.sessionAlive = true;
        }
        this.startSessionCheck();
    }

    ngOnDestroy(): void {
        this.stopSessionCheck();
    }

    get sessionToken(): string {
        if (this._sessionToken === undefined || this._sessionToken === null) {
            this.sessionToken = this.readSessionTokenFromCookie();
        }
        return this._sessionToken;
    }

    set sessionToken(value: string) {
        this._sessionToken = value;
        this.cookieService.set(KIMIOS_COOKIE, value);
    }

    setSessionAlive(): void {
        if (! this.sessionToken) {
            this.sessionAlive = false;
        } else {
            this.securityService.isSessionAlive(this.sessionToken)
                .subscribe(
                    res => {
                        this._sessionAlive = res;
                        if (this._sessionAlive === false) {
                            this.stopSessionCheck();
                            this.cookieService.delete(KIMIOS_COOKIE);
                        }
                    },
                    error => this._sessionAlive = error.error.text
                );
        }
    }

    get sessionAlive(): boolean {
        return this._sessionAlive;
    }

    set sessionAlive(alive: boolean) {
        this._sessionAlive = alive;
    }

    readSessionTokenFromCookie(): string {
        return this.cookieService.check(KIMIOS_COOKIE) ? this.cookieService.get(KIMIOS_COOKIE) : '';
    }

    retrieveUserData(): Observable<User> {
        return this.securityService.getUser(this.sessionToken);
    }

    logout(): void {
        this.securityService.endSession(this.sessionToken).subscribe(
            () => { this.cookieService.delete(KIMIOS_COOKIE); }
        );
        this.router.navigate(['/login']);
        this.stopSessionCheck();
    }

    callStartSession(login: string, source: string, pwd: string): Observable<any> {
        return this.securityService
            .startSession(login, source, pwd);
    }

    login(login: string, authenticationSource: string, password: string): void {
        let token = null;
        // const router = this.router;

        this.callStartSession(login, authenticationSource, password)
            .pipe(
                catchError(err => {
                    if (err.status === 200
                        && err.statusText === 'OK') {
                        token = err.error.text;
                        return of();
                    }
                    throwError(err);
                })
            )
            .subscribe(
                res => {
                },
                error => {
                },
                () => {
                    if (token != null) {
                        this._zone.run(() => {
                            this.sessionToken = token;
                            this.sessionAlive = true;
                            this.router.navigate(['']);
                            if (! this.isSessionCheckStarted()) {
                                this.startSessionCheck();
                            }
                        });
                    }
                }
            );
    }

    startSessionCheck(): void {
        this.intervalId = window.setInterval(
            () => this.setSessionAlive(),
            5000
        );
    }

    stopSessionCheck(): void {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    isSessionCheckStarted(): boolean {
        return (this.intervalId != null);
    }
}
