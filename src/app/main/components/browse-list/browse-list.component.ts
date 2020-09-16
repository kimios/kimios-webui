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
import {Sort} from '@angular/material';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {filter} from 'rxjs/operators';

const sortMapping = {
  'name': 'name',
  'versionUpdateDate': 'updateDate',
  'extension': 'extension'
};

@Component({
  selector: 'browse-list',
  templateUrl: './browse-list.component.html',
  styleUrls: ['./browse-list.component.scss']
})
export class BrowseListComponent implements OnInit, OnDestroy {

  @Input()
  entities$: BehaviorSubject<Array<DMEntity>>;
  dataSource: EntityDataSource;
  displayedColumns = [];
  columnsDescription: ColumnDescription[] = DEFAULT_DISPLAYED_COLUMNS;
  // Private
  private _unsubscribeAll: Subject<any>;
  selected: DMEntity;
  sort: DMEntitySort = { name: 'name', direction: 'asc' };

  constructor(
      private bes: BrowseEntityService,
      private router: Router,
      private documentDetailService: DocumentDetailService,
      private workspaceSessionService: WorkspaceSessionService
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
    this.workspaceSessionService.sort.pipe(
        filter(next => next !== undefined && next != null)
    ).subscribe(
        next => this.sort = next
    );
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

  sortData($event: Sort): void {
    if (sortMapping[$event.active] !== undefined && sortMapping != null) {
      const direction = ($event.direction !== 'asc' && $event.direction !== 'desc') ?
        'asc' :
        $event.direction;

      this.workspaceSessionService.sort.next({name: sortMapping[$event.active], direction: direction});
    }
  }
}
