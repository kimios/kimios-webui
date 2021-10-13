import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';

import {FuseConfigService} from '@fuse/services/config.service';
import {FuseSidebarService} from '@fuse/components/sidebar/sidebar.service';

import {navigation} from 'app/navigation/navigation';
import {User} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Router} from '@angular/router';
import {SearchEntityService} from 'app/services/searchentity.service';
import {FileUploadService} from 'app/services/file-upload.service';
import {DocumentExportService} from 'app/services/document-export.service';

@Component({
    selector     : 'toolbar',
    templateUrl  : './toolbar.component.html',
    styleUrls    : ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy
{
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];

    user: User = null;
    cartSize: number;

    // Private
    private _unsubscribeAll: Subject<any>;
    private searchTerms = new Subject<string>();

    sideBarIcon = 'format_list_bulleted';
    showSpinner = false;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private sessionService: SessionService,
        private searchEntityService: SearchEntityService,
        private fileUploadService: FileUploadService,
        private router: Router,
        private documentExportService: DocumentExportService
    )
    {
        // Set the defaults
        this.userStatusOptions = [
            {
                'title': 'Online',
                'icon' : 'icon-checkbox-marked-circle',
                'color': '#4CAF50'
            },
            {
                'title': 'Away',
                'icon' : 'icon-clock',
                'color': '#FFC107'
            },
            {
                'title': 'Do not Disturb',
                'icon' : 'icon-minus-circle',
                'color': '#F44336'
            },
            {
                'title': 'Invisible',
                'icon' : 'icon-checkbox-blank-circle-outline',
                'color': '#BDBDBD'
            },
            {
                'title': 'Offline',
                'icon' : 'icon-checkbox-blank-circle-outline',
                'color': '#616161'
            }
        ];

        this.languages = [
            {
                id   : 'en',
                title: 'English',
                flag : 'us'
            }/*,
            {
                id   : 'tr',
                title: 'Turkish',
                flag : 'tr'
            }*/
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, {'id': this._translateService.currentLang});

        this.sessionService.retrieveUserData()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (user) => this.user = user,
                (error) => this.user = null
            );

        this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(
                value => this.searchEntityService.searchInContent(value)
            ),
            catchError(error => {
                // TODO: real error handling
                console.log(`Error in component ... ${error}`);
                return ([]);
            })
        ).subscribe();

        this.fileUploadService.uploading$.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe(
            res =>  this.showSpinner = res
        );

        this.documentExportService.cartSize$.pipe(
            tap(size => this.cartSize = size)
        ).subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void
    {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Search
     *
     * @param value
     */
    search(value): void
    {
        // Do your search here...
        console.log(value);
        if (value.length >= 3) {
            this.searchTerms.next(value);
        }
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang): void
    {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }

    logout(): void {
        this.sessionService.logout();
    }

    navigateToCart(): boolean {
        this.router.navigate(['/cart']);
        return false;
    }
}
