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
        private sessionService: SessionService
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.loginForm = this._formBuilder.group({
            login   : ['', Validators.required],
            password: ['', Validators.required],
            authenticationSource: ['', Validators.required]
        });

        this.intervalId = window.setInterval(
            () => {
                this.loadAuthenticationSources();
            },
            1000
        );
    }

    loadAuthenticationSources(): void {
        this.securityService.getAuthenticationSources()
            .pipe(
                catchError(error => {
                    console.log('server is not responding: ' + error);
                    return of();
                })
            )
            .subscribe(
                (sources) => {
                    this.authenticationSources$ = of(sources);
                },
                (error) => console.log('server is not responding: ' + error),
                () => console.log('load try completed')
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
            this.loginForm.get('password').value
        ).subscribe(
            next => {
                this.showMessage = !next;
                this.message = !next ? 'The username or password is invalid.' : '';
            },
            null,
            null
        );
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }

}
