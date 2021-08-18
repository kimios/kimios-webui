import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {combineLatest, Observable, of} from 'rxjs';
import {META_FEED_VALUES_DEFAULT_DISPLAYED_COLUMNS, MetaFeedValuesDataSource} from './meta-feed-values-data-source';
import {MetaFeed, StudioService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {AdminService} from 'app/services/admin.service';
import {concatMap, filter, tap} from 'rxjs/operators';

@Component({
  selector: 'studio-meta-feed-admin',
  templateUrl: './studio-meta-feed-admin.component.html',
  styleUrls: ['./studio-meta-feed-admin.component.scss']
})
export class StudioMetaFeedAdminComponent implements OnInit {

  metaFeed: MetaFeed;
  formGroup: FormGroup;
  filteredJavaClassNames$: Observable<Array<string>>;
  metaFeedHasValues: boolean;
  metaFeedValuesDataSource: MetaFeedValuesDataSource;
  columnsDescription = META_FEED_VALUES_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [ 'remove', 'name' ];

  constructor(
      private studioService: StudioService,
      private sessionService: SessionService,
      private adminService: AdminService,
      private fb: FormBuilder
  ) {
    this.metaFeedHasValues = false;
    this.metaFeedValuesDataSource = new MetaFeedValuesDataSource();
    this.formGroup = this.fb.group({
      'metaFeedName': this.fb.control(''),
      'metaFeedJavaClassName': this.fb.control(null),
      'metaFeedValues': this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.adminService.selectedMetaFeed$.pipe(
        filter(metaFeedUid => metaFeedUid != null && metaFeedUid !== undefined && metaFeedUid !== 0),
        concatMap(metaFeedUid => this.studioService.getMetaFeed(this.sessionService.sessionToken, metaFeedUid)),
        tap(metaFeed => this.metaFeed = metaFeed),
        tap(metaFeed => this.metaFeedHasValues = metaFeed.className === 'org.kimios.kernel.dms.metafeeds.impl.Enumeration'),
        concatMap(metaFeed => combineLatest(of(metaFeed), this.metaFeedHasValues ?
            this.studioService.getMetaFeedValues(this.sessionService.sessionToken, metaFeed.uid) :
            of([])
        )),
        tap(([metaFeed, values]) => this.initMetaFeedFormGroup(this.formGroup, metaFeed, values)),
        tap(([metaFeed, values]) => this.metaFeedValuesDataSource.setData(values))
    ).subscribe();

    this.adminService.newMetaFeed$.pipe(
        filter(value => value === true),
        tap(() => {
          this.metaFeed = null;
          this.metaFeedValuesDataSource.setData([]);
          this.initMetaFeedFormGroup(this.formGroup, null, []);
        })
    ).subscribe();

    this.filteredJavaClassNames$ = this.studioService.getAvailableMetaFeeds(this.sessionService.sessionToken);
  }

  private initMetaFeedFormGroup(formGroup: FormGroup, metaFeed: MetaFeed, metaFeedValues: Array<string>): void {
    formGroup.get('metaFeedName').setValue(metaFeed != null ? metaFeed.name : '');
    formGroup.get('metaFeedJavaClassName').setValue(metaFeed != null ? metaFeed.className : '');
    metaFeedValues.forEach((value, index) =>
        (formGroup.get('metaFeedValues') as FormArray).setControl(index, this.fb.control(value)));
  }

  addValue(): void {

  }

  removeValue(row: any): void {

  }

  submit() {

  }

  cancel() {

  }
}
