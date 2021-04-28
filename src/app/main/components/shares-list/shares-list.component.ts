import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {AdministrationService, DMEntity} from 'app/kimios-client-api';
import {ShareDataSource, SHARES_DEFAULT_DISPLAYED_COLUMNS} from './share-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';
import {IconService} from 'app/services/icon.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Share} from 'app/kimios-client-api/model/share';
import {FormBuilder, FormGroup} from '@angular/forms';
import {PropertyFilter} from 'app/main/model/property-filter';
import {PropertyFilterString} from 'app/main/model/property-filter-string';
import {ShareExtendedService} from 'app/services/share-extended.service';

export enum SharesListMode {
  WITH_ME = 'withMe',
  BY_ME = 'byMe'
}

const sortTypeMapping = {
  'creationDate' : 'number',
  'expirationDate' : 'number',
  'entity' : 'DMEntity',
  'with': 'external'
};

const filterPropertyPathMapping = {
  'entity': 'entity.name',
  'with': 'targetUser.name'
};

@Component({
  selector: 'shares-list',
  templateUrl: './shares-list.component.html',
  styleUrls: ['./shares-list.component.scss']
})
export class SharesListComponent implements OnInit {

  @Input()
  mode: SharesListMode = SharesListMode.WITH_ME;

  dataSource: ShareDataSource;
  sort: DMEntitySort;
  filter = '';

  columnsDescription = SHARES_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns: Array<string>;
  displayedColumnsWithFilters: Array<string>;
  mappingSecondHeaderPropertyName: Map<string, string>;

  shareStatusTypes: Array<Share.ShareStatus>;
  form: FormGroup;
  formGroupFilters: FormGroup;

  constructor(
      private sessionService: SessionService,
      private shareExtendedService: ShareExtendedService,
      private iconService: IconService,
      private administrationService: AdministrationService,
      private fb: FormBuilder
  ) {
    this.sort = <DMEntitySort> {
      name: 'creationDate',
      direction: 'desc',
      type: 'number'
    };
    this.displayedColumns = this.columnsDescription.map(colDesc => colDesc.id);
    this.mappingSecondHeaderPropertyName = new Map<string, string>();
    this.columnsDescription.forEach(column => this.mappingSecondHeaderPropertyName.set(column.id + '_second-header', column.id));
    this.displayedColumnsWithFilters = Array.from(this.mappingSecondHeaderPropertyName.keys());
    this.shareStatusTypes = Array.from(Object.keys(Share.ShareStatusEnum)).map(str => str as Share.ShareStatus);
    this.form = this.fb.group({
      'statusFilters': this.fb.group({}),
      'strFilter': this.fb.control('')
    });
    this.shareStatusTypes.forEach(status =>
        (this.form.get('statusFilters') as FormGroup).addControl(status, this.fb.control(true)));
    this.formGroupFilters = this.fb.group({});
    this.displayedColumnsWithFilters.forEach(column =>
        (this.formGroupFilters as FormGroup).addControl(column, this.fb.control('')));
  }

  ngOnInit(): void {
    this.dataSource = new ShareDataSource(this.sessionService, this.shareExtendedService, this.mode);
    this.loadData();

    this.form.valueChanges.subscribe(
        value => this.loadData()
    );
    this.formGroupFilters.valueChanges.subscribe(
        value => this.loadData()
    );
  }

  loadData(): void {
    this.dataSource.loadData(
        this.sort,
        this.makeFiltersFromFormGroup(this.formGroupFilters, this.mappingSecondHeaderPropertyName),
        Object.keys((this.form.get('statusFilters') as FormGroup).controls)
            .filter(statusControl => this.form.get('statusFilters').get(statusControl).value === true) as Share.ShareStatus[]
    );
  }

  sortData($event: Sort): void {
    this.sort.name = $event.active;
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    if ((sortTypeMapping)[this.sort.name] != null) {
      this.sort.type = sortTypeMapping[this.sort.name];
    }
    if (this.sort.name === 'with') {
      const data = new Map<number, string>();
      this.dataSource.data.forEach(shareWithTargetUser =>
          data.set(shareWithTargetUser.id, shareWithTargetUser.targetUser.lastName + ', ' + shareWithTargetUser.targetUser.firstName)
      );
      this.sort.externalSortData = data;
    } else {
      this.sort.externalSortData = null;
    }
    this.loadData();
  }

  endShare(id: number): void {

  }

  retrieveDocumentIcon(element: DMEntity, iconPrefix: string): string {
    return DMEntityUtils.retrieveEntityIconName(this.iconService, element, iconPrefix);
  }

  retrieveUserName(userId: string, userSource: string): Observable<string> {
    return this.administrationService.getManageableUser(this.sessionService.sessionToken, userId, userSource).pipe(
        map(user => user.name)
    );
  }

  private makeFiltersFromFormGroup(formGroup: FormGroup, mappingControlNamePropertyName?: Map<string, string>): Array<PropertyFilter> {
    const filters = new Array<PropertyFilter>();
    Object.keys(formGroup.controls)
        .filter(key => formGroup.get(key).value.length > 0)
        .forEach(key => filters.push(new PropertyFilterString(
          mappingControlNamePropertyName && mappingControlNamePropertyName.get(key) ?
              filterPropertyPathMapping[mappingControlNamePropertyName.get(key)] != null ?
                  filterPropertyPathMapping[mappingControlNamePropertyName.get(key)] :
                  mappingControlNamePropertyName.get(key) :
              key,
            formGroup.get(key).value
        )));

    return filters;
  }
}
