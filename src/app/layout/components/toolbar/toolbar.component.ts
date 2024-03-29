import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';

import {FuseConfigService} from '@fuse/services/config.service';
import {FuseSidebarService} from '@fuse/components/sidebar/sidebar.service';

import {navigation} from 'app/navigation/navigation';
import {User} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {NavigationEnd, Router} from '@angular/router';
import {SearchEntityService} from 'app/services/searchentity.service';
import {FileUploadService} from 'app/services/file-upload.service';
import {DocumentExportService} from 'app/services/document-export.service';
import {NotificationService} from '../../../services/notification.service';

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

    sideBarIcon = 'notifications';
    showSpinner = false;
    kimiosCurrentSection: string;
    urlSectionTitleMapping: Map<string, string>;
    uploadOnError: number;
    uploadOnSuccess: number;

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
        private documentExportService: DocumentExportService,
        private notificationService: NotificationService
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

        this.urlSectionTitleMapping = new Map<string, string>();
        this.urlSectionTitleMapping.set('', 'Workspaces');
        this.urlSectionTitleMapping.set('workspaces', 'Workspaces');
        this.urlSectionTitleMapping.set('searchqueries', 'Search');
        this.urlSectionTitleMapping.set('document', 'Document');
        this.urlSectionTitleMapping.set('mybookmarks', 'My bookmarks');
        this.urlSectionTitleMapping.set('shares', 'Shares');
        this.urlSectionTitleMapping.set('settings', 'Settings');
        this.urlSectionTitleMapping.set('cart', 'Cart');
        // this.urlSectionTitleMapping.set('overview', 'Overview');
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
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(
                value => this.searchEntityService.searchWithFiltersAndSetCurrentQuery(
                  null,
                  value,
                  null,
                  null,
                  null,
                  null,
                  null,
                  null,
                  null,
                  null,
                  false,
                  true
                )
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

        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd),
          tap((event: NavigationEnd) => this.kimiosCurrentSection = this.initTitle(event.urlAfterRedirects))
        ).subscribe();

        this.notificationService.uploadFinished.pipe(
          takeUntil(this._unsubscribeAll),
          tap(() => this.uploadOnSuccess = this.notificationService.getNbUploadOnSuccess()),
          tap(() => this.uploadOnError = this.notificationService.getNbUploadOnError()),
          tap(() => console.log('upload success error : ' + this.uploadOnSuccess + ' ' + this.uploadOnError))
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

    private initTitle(urlAfterRedirects: string): string {
        const regex = /^\/([^\/]+)(?:\/.*)?$/;
        const match = urlAfterRedirects.match(regex);
        return match != null
        && match[1] != null
        && this.urlSectionTitleMapping.get(match[1]) != null ?
          this.urlSectionTitleMapping.get(match[1]) :
          '';
    }
}
