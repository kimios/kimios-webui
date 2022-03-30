import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { Subject } from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';

import {Document as KimiosDocument} from 'app/kimios-client-api/model/document';
import {SearchEntityService} from 'app/services/searchentity.service';
import {Router} from '@angular/router';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {MatAutocompleteTrigger} from '@angular/material';

@Component({
    selector   : 'fuse-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls  : ['./search-bar.component.scss']
})
export class FuseSearchBarComponent implements OnInit, OnDestroy
{
    collapsed: boolean;
    fuseConfig: any;
    filteredDocs: Array<KimiosDocument>;

    @Output()
    input: EventEmitter<any>;

    // Private
    private _unsubscribeAll: Subject<any>;

    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private searchEntityService: SearchEntityService,
        private router: Router
    )
    {
        // Set the defaults
        this.input = new EventEmitter();
        this.collapsed = true;

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.filteredDocs = new Array<KimiosDocument>();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (config) => {
                    this.fuseConfig = config;
                }
            );

        this.searchEntityService.documentListForAutoComplete$.pipe(
          takeUntil(this._unsubscribeAll),
          tap(docList => this.filteredDocs = docList)
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
     * Collapse
     */
    collapse(): void
    {
        this.collapsed = true;
    }

    /**
     * Expand
     */
    expand(): void
    {
        this.collapsed = false;
    }

    /**
     * Search
     *
     * @param event
     */
    search(event): void
    {
        this.input.emit(event.target.value);
    }

    goToDoc(doc: KimiosDocument): void {
        DocumentUtils.navigateToFile(this.router, doc.uid);
    }

    goToSearch($event: any): void {
        this.router.navigate(['/searchqueries', $event.target.value]);
        this.autocomplete.closePanel();
        this.collapse();
    }
}
