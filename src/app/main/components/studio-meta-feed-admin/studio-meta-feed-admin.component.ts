import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {combineLatest, Observable, of} from 'rxjs';
import {META_FEED_VALUES_DEFAULT_DISPLAYED_COLUMNS, MetaFeedValue, MetaFeedValuesDataSource} from './meta-feed-values-data-source';
import {MetaFeed, StudioService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {AdminService} from 'app/services/admin.service';
import {concatMap, filter, tap} from 'rxjs/operators';

export const META_FEED_ENUMERATION_CLASS_NAME = 'org.kimios.kernel.dms.metafeeds.impl.Enumeration';

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

  @ViewChildren('metaFeedValueInput') metaFeedValueInputs: QueryList<ElementRef>;

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
        tap(metaFeed => this.metaFeedHasValues = (metaFeed.className === META_FEED_ENUMERATION_CLASS_NAME)),
        concatMap(metaFeed => combineLatest(of(metaFeed), this.metaFeedHasValues ?
            this.studioService.getMetaFeedValues(this.sessionService.sessionToken, metaFeed.uid) :
            of([])
        )),
        tap(([metaFeed, values]) => {
          this.initMetaFeedFormGroup(this.formGroup, metaFeed, values);
          this.metaFeedValuesDataSource.setData(
              values
                  .map((val, index) => <MetaFeedValue> {value: val, id: index} )
                  .sort((a, b) => a.id < b.id ? -1 : 1)
          );
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

    this.formGroup.get('metaFeedJavaClassName').valueChanges.pipe(
        tap((value) => {
          if (value === META_FEED_ENUMERATION_CLASS_NAME) {
            this.metaFeedHasValues = true;
          } else {
            this.metaFeedHasValues = false;
          }
        })
    ).subscribe();
  }

  private initMetaFeedFormGroup(formGroup: FormGroup, metaFeed: MetaFeed, metaFeedValues: Array<string>): void {
    formGroup.get('metaFeedName').setValue(metaFeed != null ? metaFeed.name : '');
    formGroup.get('metaFeedJavaClassName').setValue(metaFeed != null ? metaFeed.className : '');
    formGroup.removeControl('metaFeedValues');
    formGroup.addControl('metaFeedValues', this.fb.group({}));
    metaFeedValues.forEach((value, index) =>
        (formGroup.get('metaFeedValues') as FormGroup).addControl(index.toString(), this.fb.control(value)));
    if (metaFeed != null) {
      formGroup.get('metaFeedJavaClassName').disable();
    } else {
      formGroup.get('metaFeedJavaClassName').enable();
    }
  }

  addValue(): void {
    const data = this.metaFeedValuesDataSource.connect().getValue();
    const newValueId = data.length > 0 ?
        data.sort((a, b) => a.id > b.id ? -1 : 1)[0].id + 1 :
        0;
    (this.formGroup.get('metaFeedValues') as FormGroup).addControl(
        newValueId.toString(),
        this.fb.control('')
    );
    this.metaFeedValuesDataSource.setData(
        data
            .concat(<MetaFeedValue> {value: '', id: newValueId})
            .sort((a, b) => a.id < b.id ? -1 : 1)
    );
    setTimeout(() => {
      console.dir(this.metaFeedValueInputs.toArray());
          this.metaFeedValueInputs
              .toArray()
              .filter(value => Number(value['_elementRef'].nativeElement.getAttribute('id')) === newValueId)
              [0]['_elementRef'].nativeElement.focus();
          /*array.filter((input: ElementRef) => input.getAttribute('id') === newValueId)[0]
              .nativeElement.focus();*/
        },
        300
    );
  }

  removeValue(row: any): void {
    const data = this.metaFeedValuesDataSource.connect().getValue();
    const indexToDelete = data.findIndex(value => value.id === row.id);
    if (indexToDelete !== -1) {
      data.splice(indexToDelete, 1);
    }
    this.metaFeedValuesDataSource.setData(data.sort((a, b) => a.id < b.id ? -1 : 1));
    (this.formGroup.get('metaFeedValues') as FormGroup).removeControl(row.id.toString());
  }

  submit(): void {
    if (this.metaFeed != null) {
      // update metaFeed
      this.studioService.updateMetaFeed(
          this.sessionService.sessionToken,
          this.metaFeed.uid, this.formGroup.get('metaFeedName').value
      ).subscribe(
          res => { if (this.formGroup.get('metaFeedName').value !== this.metaFeed.name) {
            this.adminService.needRefreshMetaFeeds$.next(true);
          }}
      );
      if (this.metaFeedHasValues) {
        this.studioService.updateEnumerationValues(
            this.sessionService.sessionToken,
            this.makeEnumerationValuesXmlStream(
                this.metaFeed.uid,
                Object.keys((this.formGroup.get('metaFeedValues') as FormGroup).controls).map(key =>
                    this.formGroup.get('metaFeedValues').get(key).value
                )
            )
        ).subscribe();
      }
    } else {
      // creation
      this.studioService.createMetaFeed(
          this.sessionService.sessionToken,
          this.formGroup.get('metaFeedName').value,
          this.formGroup.get('metaFeedJavaClassName').value
      ).pipe(
          tap(metaFeedUid => this.adminService.selectedMetaFeed$.next(metaFeedUid)),
          concatMap(metaFeedUid => this.studioService.updateEnumerationValues(
              this.sessionService.sessionToken,
              this.makeEnumerationValuesXmlStream(
                  metaFeedUid,
                  Object.keys((this.formGroup.get('metaFeedValues') as FormGroup).controls).map(key =>
                      this.formGroup.get('metaFeedValues').get(key).value
                  )
              )
          ))
      ).subscribe(
          res => this.adminService.needRefreshMetaFeeds$.next(true)
      );
    }
  }

  cancel(): void {

  }

  private makeEnumerationValuesXmlStream(uid: number, metaFeedValues: Array<string>): string {
    let xmlStream = '<?xml version="1.0" encoding="UTF-8"?>';
    xmlStream += '<enumeration uid="' + uid + '">';
    xmlStream += metaFeedValues.map(value => this.makeEnumerationValueXmlElement(value)).join('');
    xmlStream += '</enumeration>';

    return xmlStream;
  }

  private makeEnumerationValueXmlElement(value: string): string {
    return '<entry value="' + value + '" />';
  }
}
