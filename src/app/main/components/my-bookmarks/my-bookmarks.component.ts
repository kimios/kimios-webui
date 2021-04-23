import {Component, OnInit} from '@angular/core';
import {Bookmark, DMEntity, DocumentService} from 'app/kimios-client-api';
import {BOOKMARKS_DEFAULT_DISPLAYED_COLUMNS, BookmarksDataSource} from './bookmarks-data-source';
import {SessionService} from 'app/services/session.service';
import {MatDialog, Sort} from '@angular/material';
import {DMEntitySortSubElement} from 'app/main/model/dmentity-sort-sub-element';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {concatMap, filter} from 'rxjs/operators';
import {Router} from '@angular/router';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {IconService} from 'app/services/icon.service';

@Component({
  selector: 'my-bookmarks',
  templateUrl: './my-bookmarks.component.html',
  styleUrls: ['./my-bookmarks.component.scss']
})
export class MyBookmarksComponent implements OnInit {

  dataSource: BookmarksDataSource;
  sort: DMEntitySortSubElement;
  filter = '';

  columnsDescription = BOOKMARKS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns: Array<string>;

  constructor(
      private documentService: DocumentService,
      private sessionService: SessionService,
      public dialog: MatDialog,
      private router: Router,
      private bes: BrowseEntityService,
      private iconService: IconService
  ) {
    this.sort = <DMEntitySortSubElement> {
      name: 'name',
      direction: 'asc',
      subElement: 'entity'
    };
    this.displayedColumns = this.columnsDescription.map(colDesc => colDesc.id);
    this.displayedColumns.unshift('remove');
  }

  ngOnInit(): void {
    this.dataSource = new BookmarksDataSource(this.sessionService, this.documentService);
    this.dataSource.loadData(this.sort, this.filter);
  }

  sortData($event: Sort): void {
    this.sort.name = $event.active;
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    this.dataSource.loadData(
        this.sort,
        null
    );
  }

  removeBookmark(bookmark: Bookmark): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle: 'Delete bookmark?',
        iconLine1: DMEntityUtils.retrieveEntityIconName(this.iconService, bookmark.entity, 'far'),
        messageLine1: bookmark.entity.name
      }
    });

    dialogRef.afterClosed().pipe(
        filter(res => res === true),
        concatMap(res => this.documentService.removeBookmark(this.sessionService.sessionToken, bookmark.entity.uid))
    ).subscribe(
        null,
        null,
        () => this.dataSource.loadData(this.sort, this.filter)
    );
  }

    goToEntity(entity: DMEntity): void {
      this.bes.goToEntity(entity, this.router);
    }
}
