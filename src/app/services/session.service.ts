import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {SecurityService, User} from 'app/kimios-client-api';
import {CookieService} from 'ngx-cookie-service';
import {BehaviorSubject, Observable, of, Subscription, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {catchError, concatMap, filter, tap} from 'rxjs/operators';
import {CacheService} from './cache.service';
import {environment} from '../../environments/environment';

const KIMIOS_COOKIE_ST = 'kimios_st';
export const KIMIOS_COOKIE_WST = 'kimios_wst';

@Injectable({
    providedIn: 'root'
})
export class SessionService implements OnDestroy {
    private _sessionToken: string = null;
    private _sessionAlive: boolean;
    private intervalId: number;
    private _currentUser: User;
    public dirtyForm$: BehaviorSubject<boolean>;
    private checkSessionSubscription: Subscription;

    constructor(
        private securityService: SecurityService,
        private cookieService: CookieService,
        private cacheService: CacheService,
        private router: Router,
        public _zone: NgZone
    ) {
        // if sessionToken is read from cookie, we temporarily consider session alive
        if (this.sessionToken) {
            this.sessionAlive = true;
        }
        this.setSessionAlive();
        this.startSessionCheck();
        this.dirtyForm$ = new BehaviorSubject<boolean>(false);

        this.checkSessionSubscription =
        this.cacheService.newWebSocketToken$.pipe(
          filter(next => next !== '')
        ).subscribe(
          next => this.setCookie(KIMIOS_COOKIE_WST, next)
        );
    }

    ngOnDestroy(): void {
        this.stopSessionCheck();
        this.checkSessionSubscription.unsubscribe();
    }

    get sessionToken(): string {
        if (this._sessionToken == null || this._sessionToken === undefined) {
            const token = this.readTokenFromCookie(KIMIOS_COOKIE_ST);
            this._sessionToken = token ? token : null;
        }
        return this._sessionToken;
    }

    set sessionToken(value: string) {
        this._sessionToken = value;
        this.setCookie(KIMIOS_COOKIE_ST, this._sessionToken);
    }

    setCookie(cookieName: string, cookieValue: string): void {
        this.cookieService.set(
          cookieName,
          cookieValue,
          null,
          '/'
        );
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
                            this.cookieService.delete(KIMIOS_COOKIE_ST);
                            this.cookieService.delete(KIMIOS_COOKIE_WST);
                        } else {
                            if (this.cacheService.webSocket == null || this.cacheService.webSocket === undefined) {
                                const token = this.readTokenFromCookie(KIMIOS_COOKIE_WST);
                                if (token != null) {
                                    this.cacheService.initWebSocket(environment.apiPath + '/chat/chat/', token);
                                } else {
                                    this.disconnect();
                                }
                            }
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

    get currentUser(): User {
        return this._currentUser;
    }

    getCurrentUserObs(): Observable<User> {
        return (this._currentUser == null
        || this._currentUser === undefined) ?
            this.retrieveUserData() :
            of(this._currentUser);
    }

    readTokenFromCookie(cookieName: string): string {
        if (! this.cookieService.check(cookieName)) {
            return null;
        }
        const cookieValue = this.cookieService.get(cookieName);

        return cookieValue;
    }

    retrieveUserData(): Observable<User> {
        return this.securityService.getUser(this.sessionToken).pipe(
            tap(res => this._currentUser = res)
        );
    }

    logout(): void {
        this.stopSessionCheck();
        this.securityService.endSession(this.sessionToken).subscribe(
            () => {
                this.cookieService.delete(KIMIOS_COOKIE_ST);
                this.cookieService.delete(KIMIOS_COOKIE_WST);
            }
        );
        this.router.navigate(['/login']).then(
            () => window.location.reload()
        );
    }

    disconnect(): Observable<string> {
        return this.securityService.endSession(this.sessionToken).pipe(
            tap(
                res => {
                    this.cookieService.delete(KIMIOS_COOKIE_ST);
                    this.cookieService.delete(KIMIOS_COOKIE_WST);
                    this.sessionToken = '';
                    this.sessionAlive = false;
                }
            ),
            concatMap(
                res => of(res)
            )
        );
    }

    callStartSession(login: string, source: string, pwd: string): Observable<any> {
        return this.securityService
            .startSession(login, source, pwd);
    }

    login(login: string, authenticationSource: string, password: string, rememberMe: boolean): Observable<User> {

        return this.callStartSession(login, authenticationSource, password)
            .pipe(
                catchError(err => {
                    if (err.status === 200
                        && err.statusText === 'OK') {
                        return of(true);
                    } else {
                        if (err.status === 500) {
                            return of(false);
                        }
                    }
                }),
                tap(res => {
                    if (res
                      && res['sessionUid'] != null
                      && res['sessionUid'] !== undefined) {
                        this.sessionToken = res['sessionUid'];
                        this.cacheService.initWebSocket(environment.apiPath + '/chat/chat/', res['wsToken']);
                    }
                }),
                concatMap(res => res
                  && res['sessionUid'] != null
                  && res['sessionUid'] !== undefined ?
                  this.securityService.getUser(res['sessionUid']) :
                  null
                ),
                tap(
                  (user) => {
                        if (user != null) {
                            this._zone.run(() => {
                                this._currentUser = user;
                                // this.initCurrentUser(this.sessionToken);
                                this.sessionAlive = true;
                                this.router.navigate(['']);
                                if (! this.isSessionCheckStarted()) {
                                    this.startSessionCheck();
                                }
                            });
                            if (rememberMe) {
                                localStorage.setItem('currentUser', this._currentUser.uid);
                                localStorage.setItem('currentSource', this._currentUser.source);
                                localStorage.setItem('currentPassword', password);
                                localStorage.setItem('rememberMe', String(rememberMe));
                            } else {
                                localStorage.removeItem('currentUser');
                                localStorage.removeItem('currentSource');
                                localStorage.removeItem('currentPassword');
                                localStorage.removeItem('rememberMe');
                            }
                        }
                    }
                )
            );
    }

    private initCurrentUser(token): void {
        this.securityService.getUser(token).subscribe(
            user => this._currentUser = user
        );
    }

    connect(login: string, authenticationSource: string, password: string): Observable<string> {
        return this.callStartSession(login, authenticationSource, password)
            .pipe(
                catchError(err => {
                    if (err.status === 200
                        && err.statusText === 'OK') {
                        const token = err.error.text;
                        return of(token);
                    }
                    throwError(err);
                }),
                tap(
                    res => {
                        this.sessionToken = res;
                        this.sessionAlive = true;
                    }
                )
            );
    }

    startSessionCheck(): void {
        this.intervalId = window.setInterval(
            () => this.setSessionAlive(),
            30000
        );
    }

    stopSessionCheck(): void {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    isSessionCheckStarted(): boolean {
        return (this.intervalId != null);
    }

    currentUserIsAdmin(): Observable<boolean> {
        return this.securityService.isAdmin(this.sessionToken);
    }

    currentUserHasStudioAccess(): Observable<boolean> {
        return this.securityService.hasStudioAccess(this.sessionToken);
    }
}
