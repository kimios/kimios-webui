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

    logout(): void {
        this.securityService.endSession(this.sessionToken).subscribe();
        this.router.navigate(['/login']);
        clearInterval(this.intervalId);
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
                            this.intervalId = window.setInterval(
                                () => this.setSessionAlive(),
                                5000
                            );
                        });
                    }
                }
            );
    }
}
