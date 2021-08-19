import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {combineLatest, Observable, of} from 'rxjs';
import {META_FEED_VALUES_DEFAULT_DISPLAYED_COLUMNS, MetaFeedValue, MetaFeedValuesDataSource} from './meta-feed-values-data-source';
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
  displayedColumns = [ 'remove', 'value' ];

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
      'metaFeedValues': this.fb.group({})
    });
  }

  ngOnInit(): void {
    this.adminService.selectedMetaFeed$.pipe(
        filter(metaFeedUid => metaFeedUid != null && metaFeedUid !== undefined && metaFeedUid !== 0),
        concatMap(metaFeedUid => this.studioService.getMetaFeed(this.sessionService.sessionToken, metaFeedUid)),
        tap(metaFeed => this.metaFeed = metaFeed),
        tap(metaFeed => this.metaFeedHasValues = (metaFeed.className === 'org.kimios.kernel.dms.metafeeds.impl.Enumeration')),
        concatMap(metaFeed => combineLatest(of(metaFeed), this.metaFeedHasValues ?
            this.studioService.getMetaFeedValues(this.sessionService.sessionToken, metaFeed.uid) :
            of([])
        )),
        tap(([metaFeed, values]) => {
          this.initMetaFeedFormGroup(this.formGroup, metaFeed, values);
          this.metaFeedValuesDataSource.setData(values.map(val => <MetaFeedValue> {value: val} ));
        })
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
    formGroup.removeControl('metaFeedValues');
    formGroup.addControl('metaFeedValues', this.fb.group({}));
    metaFeedValues.forEach((value, index) =>
        (formGroup.get('metaFeedValues') as FormGroup).addControl(index.toString(), this.fb.control(value)));
  }

  addValue(): void {
    (this.formGroup.get('metaFeedValues') as FormGroup).addControl(
        (Number(Object.keys((this.formGroup.get('metaFeedValues') as FormGroup).controls)
            .sort((a, b) => Number(a) > Number(b) ? -1 : 1)[0]) + 1).toString(),
        this.fb.control('')
    );
    const data = this.metaFeedValuesDataSource.connect().getValue();
    this.metaFeedValuesDataSource.setData(data.concat(<MetaFeedValue> {value: ''}));
  }

  removeValue(row: any): void {

  }

  submit(): void {

  }

  cancel(): void {

  }
}
