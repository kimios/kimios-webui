import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {DEFAULT_DISPLAYED_COLUMNS, EntityDataSource} from 'app/main/file-manager/entity-data-source';
import {ColumnDescription} from 'app/main/model/column-description';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {Router} from '@angular/router';
import {DocumentDetailService} from 'app/services/document-detail.service';

@Component({
  selector: 'browse-list',
  templateUrl: './browse-list.component.html',
  styleUrls: ['./browse-list.component.scss']
})
export class BrowseListComponent implements OnInit, OnDestroy {

  @Input()
  entities$: BehaviorSubject<Array<DMEntity>>;
  private dataSource: EntityDataSource;
  displayedColumns = [];
  columnsDescription: ColumnDescription[] = DEFAULT_DISPLAYED_COLUMNS;
  // Private
  private _unsubscribeAll: Subject<any>;
  selected: DMEntity;

  constructor(
      private bes: BrowseEntityService,
      private router: Router,
      private documentDetailService: DocumentDetailService
  ) {
    this.columnsDescription.forEach((elem) => {
      this.displayedColumns.push(elem.matHeaderCellDef);
    });
    this.displayedColumns.push('actions');
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.dataSource = new EntityDataSource(this.entities$);
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

  onSelect(row: DMEntity): void {
    this.selected = row;
  }

  goToDocument(entityFromList: any): void {
    if (DMEntityUtils.dmEntityIsFolder(entityFromList) || DMEntityUtils.dmEntityIsWorkspace(entityFromList)) {
      this.bes.goInContainerEntity(entityFromList);
    } else {
      DocumentUtils.navigateToFile(this.router, entityFromList.uid);
    }
  }

  handleFileDownload(versionId: number): void {
    this.documentDetailService.downloadDocumentVersion(versionId);
  }
}
