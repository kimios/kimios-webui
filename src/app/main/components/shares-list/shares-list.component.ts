import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {AdministrationService, DMEntity, ShareService} from 'app/kimios-client-api';
import {ShareDataSource, SHARES_DEFAULT_DISPLAYED_COLUMNS} from './share-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {MatDialog, Sort} from '@angular/material';
import {IconService} from 'app/services/icon.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {Observable} from 'rxjs';
import {concatMap, filter, map, tap} from 'rxjs/operators';
import {Share} from 'app/kimios-client-api/model/share';
import {FormBuilder, FormGroup} from '@angular/forms';
import {PropertyFilter} from 'app/main/model/property-filter';
import {PropertyFilterString} from 'app/main/model/property-filter-string';
import {ShareExtendedService} from 'app/services/share-extended.service';
import {PropertyFilterArray} from 'app/main/model/property-filter-array';
import {ColumnDescription} from 'app/main/model/column-description';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {Router} from '@angular/router';
import {ShareWithTargetUser} from 'app/main/model/share-with-target-user';
import {ShareEditDialogComponent} from 'app/main/components/share-edit-dialog/share-edit-dialog.component';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

export enum SharesListMode {
  WITH_ME = 'withMe',
  BY_ME = 'byMe'
}

const sortTypeMapping = {
  'creationDate' : 'number',
  'expirationDate' : 'number',
  'entity' : 'DMEntity',
  'with': 'external',
  'by': 'external'
};

const filterPropertyPathMapping = {
  'entity': 'entity.name',
  'with': 'targetUserId',
  'by': 'creatorId'
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
  propertyFilterString: Array<string>;

  shareStatusTypes: Array<Share.ShareStatus>;
  formGroupFilters: FormGroup;
  shareStatusValue: Array<string>;

  constructor(
      private sessionService: SessionService,
      private shareExtendedService: ShareExtendedService,
      private iconService: IconService,
      private administrationService: AdministrationService,
      private fb: FormBuilder,
      private bes: BrowseEntityService,
      private router: Router,
      public dialog: MatDialog,
      private shareService: ShareService
  ) {
    this.sort = <DMEntitySort> {
      name: 'creationDate',
      direction: 'desc',
      type: 'number'
    };
  }

  ngOnInit(): void {
    this.columnsDescription = this.chooseColumnsToDisplayAccordingToMode(this.mode, this.columnsDescription);
    this.displayedColumns = this.columnsDescription.map(colDesc => colDesc.id);
    this.mappingSecondHeaderPropertyName = new Map<string, string>();
    this.columnsDescription.forEach(column => this.mappingSecondHeaderPropertyName.set(column.id + '_second-header', column.id));
    if (this.mode === SharesListMode.BY_ME) {
      const columnId = 'actions';
      this.displayedColumns.push(columnId);
      this.mappingSecondHeaderPropertyName.set(columnId + '_second-header', columnId);
    }
    this.displayedColumnsWithFilters = Array.from(this.mappingSecondHeaderPropertyName.keys());
    this.shareStatusTypes = Array.from(Object.keys(Share.ShareStatusEnum)).map(str => str as Share.ShareStatus);
    this.formGroupFilters = this.initFormGroupFilters(this.mode);
    this.propertyFilterString = this.initPropertyFilterString();
    this.shareStatusValue = this.shareStatusTypes;
    this.formGroupFilters.get('shareStatus').setValue(this.shareStatusValue);

    this.dataSource = new ShareDataSource(this.sessionService, this.shareExtendedService, this.mode);
    this.loadData();

    this.formGroupFilters.valueChanges.subscribe(
        value => this.loadData()
    );

    this.bes.shareDocumentReturn$.subscribe(
        res => {
          if (res === true) {
            this.loadData(true);
          }
        }
    );
  }

  private initFormGroupFilters(mode: SharesListMode): FormGroup {
    const formGroup: FormGroup = this.fb.group({
      'entity': this.fb.control(''),
      'shareStatus': this.fb.control([])
    });
    if (mode === SharesListMode.WITH_ME) {
      formGroup.addControl('by', this.fb.control(''));
    } else {
      formGroup.addControl('with', this.fb.control(''));
    }
    return formGroup;
  }

  private chooseColumnsToDisplayAccordingToMode(mode: SharesListMode, columnsDescription: Array<ColumnDescription>): Array<ColumnDescription> {
    const excludedColumns = new Array<string>();
    if (this.mode === SharesListMode.WITH_ME) {
      excludedColumns.push('with');
    } else {
      excludedColumns.push('by');
    }
    return columnsDescription.filter(col => !excludedColumns.includes(col.id));
  }

  loadData(refreshCache?: boolean): void {
    this.dataSource.loadData(
        this.sort,
        this.makeFiltersFromFormGroup(this.formGroupFilters, this.propertyFilterString),
        refreshCache
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

  private makeFiltersFromFormGroup(formGroup: FormGroup, propertyFilterString?: Array<string>): Array<PropertyFilter> {
    const filters = new Array<PropertyFilter>();
    Object.keys(formGroup.controls)
        .filter(key => propertyFilterString.includes(key))
        .filter(key => formGroup.get(key).value.length > 0)
        .forEach(key => {
          const keyMapped = filterPropertyPathMapping[key] ? filterPropertyPathMapping[key] : key;
          filters.push(new PropertyFilterString(keyMapped, formGroup.get(key).value));
        });

    filters.push(new PropertyFilterArray('shareStatus', formGroup.get('shareStatus').value));

    console.dir(filters);

    return filters;
  }

  private initPropertyFilterString(): Array<string> {
    const propertyFilterString = ['entity'];
    if (this.mode === SharesListMode.WITH_ME) {
      propertyFilterString.push('by');
    } else {
      propertyFilterString.push('with');
    }
    return propertyFilterString;
  }

  goToDocument(entity: DMEntity): void {
    this.bes.goToEntity(entity, this.router);
  }

  handleDblclick(row: ShareWithTargetUser): void {
    if (this.mode === SharesListMode.WITH_ME) {
      this.goToDocument(row.entity);
    }
  }

  handleEditShare(element: ShareWithTargetUser): void {
    const dialogRef = this.dialog.open(ShareEditDialogComponent, {
      data: {
        'uid': -1,
        'name': '',
        'share': element
      },
      panelClass: 'kimios-dialog'
    });
  }

  handleDeleteShare(element: ShareWithTargetUser): void {
    const messageLine1 = 'Delete share of document '
        + element.entity.name;
    const messageLine2 = ' with user '
        + element.targetUserId
        + '@'
        + element.targetUserSource
        + '?';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        'messageLine1': messageLine1,
        'messageLine2': messageLine2,
      },
      width: '400px',
      height: '400px'
    });

    dialogRef.afterClosed().pipe(
        filter(result => result === true),
        concatMap(result => this.shareService.removeShare(this.sessionService.sessionToken, element.id))
    ).subscribe(
        res => this.loadData(true)
    );
  }
}
