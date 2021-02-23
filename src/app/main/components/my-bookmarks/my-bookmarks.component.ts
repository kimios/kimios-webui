import {Component, OnInit} from '@angular/core';
import {Bookmark, DocumentService} from 'app/kimios-client-api';
import {BOOKMARKS_DEFAULT_DISPLAYED_COLUMNS, BookmarksDataSource} from './bookmarks-data-source';
import {SessionService} from 'app/services/session.service';
import {Sort} from '@angular/material';
import {DMEntitySortSubElement} from 'app/main/model/dmentity-sort-sub-element';

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
      private sessionService: SessionService
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
    this.documentService.removeBookmark(this.sessionService.sessionToken, bookmark.entity.uid).subscribe();
  }
}
