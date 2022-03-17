import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {FuseConfigService} from '@fuse/services/config.service';
import {fuseAnimations} from '@fuse/animations';

import {UserService} from 'app/user.service';
import {SecurityService} from 'app/kimios-client-api/api/api';
import {AuthenticationSource} from 'app/kimios-client-api';
import {Observable, of, throwError} from 'rxjs';
import {SessionService} from 'app/services/session.service';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';

@Component({
    selector     : 'login',
    templateUrl  : './login.component.html',
    styleUrls    : ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LoginComponent implements OnInit, OnDestroy {
    authenticationSources$: Observable<{} | AuthenticationSource[]>;
    private intervalId: number;

    public showMessage: boolean;
    public message: string;

    passwordInputType: 'password' | 'text' = 'password';
    visibilityIconName: 'visibility_off' | 'visibility' = 'visibility_off';
    visibilityIconTitle: string;

    loginForm = new FormGroup({
        login: new FormControl(''),
        password: new FormControl(''),
        authenticationSource: new FormControl('')
    });

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private userService: UserService,
        private securityService: SecurityService,
        private sessionService: SessionService,
        private router: Router
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
        this.showMessage = false;
        this.message = '';

        this.visibilityIconTitle = this.passwordInputType === 'text' ? 'Hide password' : 'Show password';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        if (this.sessionService.sessionAlive) {
            this.router.navigate(['workspaces']);
        }

        this.loginForm = this._formBuilder.group({
            login   : ['', Validators.required],
            password: ['', Validators.required],
            authenticationSource: ['', Validators.required],
            rememberMe: this._formBuilder.control(false)
        });
        this.initLoginForm();

        this.loadAuthenticationSources();
        this.intervalId = window.setInterval(
            () => {
                this.loadAuthenticationSources();
            },
            5000
        );
    }

    loadAuthenticationSources(): void {
        this.securityService.getAuthenticationSources()
            .pipe(
                catchError(error => {
                    return of();
                })
            )
            .subscribe(
                (sources) => {
                    this.authenticationSources$ = of(sources);
                },
                /*(error) => console.log('server is not responding: ' + error),
                () => console.log('load try completed')*/
            );
    }

    callStartSession(login: string, source: string, pwd: string): Observable<any> {
        return this.securityService
            .startSession(
                this.loginForm.get('login').value,
                this.loginForm.get('authenticationSource').value,
                this.loginForm.get('password').value
            );
    }

    onSubmit(): void {
        this.sessionService.login(this.loginForm.get('login').value,
            this.loginForm.get('authenticationSource').value,
            this.loginForm.get('password').value,
            this.loginForm.get('rememberMe').value
        ).subscribe(
            next => {
                this.showMessage = (next == null);
                this.message = (next == null) ? 'The username or password is invalid.' : '';
            },
            null,
            null
        );
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }

    toggleVisibility(): void {
        if (this.visibilityIconName === 'visibility_off') {
            this.passwordInputType = 'text';
            this.visibilityIconName = 'visibility';
        } else {
            this.passwordInputType = 'password';
            this.visibilityIconName = 'visibility_off';
        }
    }

    private initLoginForm(): void {
        if (localStorage.getItem('currentUser') != null) {
            this.loginForm.get('login').setValue(localStorage.getItem('currentUser'));
        }
        if (localStorage.getItem('currentSource') != null) {
            this.loginForm.get('authenticationSource').setValue(localStorage.getItem('currentSource'));
        }
        if (localStorage.getItem('currentPassword') != null) {
            this.loginForm.get('password').setValue(localStorage.getItem('currentPassword'));
        }
        if (localStorage.getItem('rememberMe') != null) {
            this.loginForm.get('rememberMe').setValue(localStorage.getItem('rememberMe'));
        }
    }
}
