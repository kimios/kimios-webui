import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {FuseConfigService} from '@fuse/services/config.service';
import {fuseAnimations} from '@fuse/animations';

import {Router} from '@angular/router';

import {UserService} from 'app/user.service';
import {SecurityService} from 'app/kimios-client-api/api/api';
import {AuthenticationSource} from '../../../../kimios-client-api';

@Component({
    selector     : 'login',
    templateUrl  : './login.component.html',
    styleUrls    : ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LoginComponent implements OnInit
{
    loginForm: FormGroup;

    authenticationSources: Array<AuthenticationSource>;

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
        private router: Router,
        private securityService: SecurityService
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
            email   : ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            authenticationSource: ['', Validators.required]
        });

        this.securityService.getAuthenticationSources().subscribe(
            (sources) => {
                this.authenticationSources = sources;
            }
        );
    }

    onSubmit(email: string, password: string): void {
        this.userService.login(email, password).subscribe((result) => {
            if (result) {
                this.router.navigate(['']);
            }
        });
    }
}
