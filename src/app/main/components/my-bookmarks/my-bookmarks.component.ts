import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
import {Bookmark, DMEntity, DocumentService} from 'app/kimios-client-api';
import {BOOKMARKS_DEFAULT_DISPLAYED_COLUMNS, BookmarksDataSource} from './bookmarks-data-source';
import {SessionService} from 'app/services/session.service';
import {MatDialog, MatTable, Sort} from '@angular/material';
import {DMEntitySortSubElement} from 'app/main/model/dmentity-sort-sub-element';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {concatMap, filter, map, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {IconService} from 'app/services/icon.service';
import {FormControl} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {EntityCacheService} from 'app/services/entity-cache.service';

@Component({
  selector: 'my-bookmarks',
  templateUrl: './my-bookmarks.component.html',
  styleUrls: ['./my-bookmarks.component.scss']
})
export class MyBookmarksComponent implements OnInit, AfterViewChecked {

  dataSource: BookmarksDataSource;
  sort: DMEntitySortSubElement;
  filter = '';

  columnsDescription = BOOKMARKS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns: Array<string>;

  dataSearch = new FormControl('');
  filteredData$: Observable<Array<Bookmark>>;
  @ViewChild('matTable') matTable: MatTable<Bookmark>;
  entityUpdated$: Subject<number>;

  constructor(
      private documentService: DocumentService,
      private sessionService: SessionService,
      public dialog: MatDialog,
      private router: Router,
      private bes: BrowseEntityService,
      private iconService: IconService,
      private entityCacheService: EntityCacheService
  ) {
    this.sort = <DMEntitySortSubElement> {
      name: 'name',
      direction: 'asc',
      subElement: 'entity'
    };
    this.displayedColumns = this.columnsDescription.map(colDesc => colDesc.id);
    this.displayedColumns.unshift('remove');
    this.entityUpdated$ = new Subject<number>();
  }

  ngOnInit(): void {
    this.dataSource = new BookmarksDataSource(this.sessionService, this.entityCacheService);
    this.dataSource.loadData(this.sort, this.filter);
    this.dataSearch.valueChanges.pipe(
        map(value => this.filterData())
    ).subscribe();

    this.entityCacheService.documentUpdate$.pipe(
      tap(docId => this.entityUpdated$.next(docId))
    ).subscribe();

    this.entityCacheService.folderUpdated$.pipe(
      tap(folderId => this.entityUpdated$.next(folderId))
    ).subscribe();

    this.entityUpdated$.pipe(
      tap(entityId => this.dataSource.updateEntityData(entityId))
    ).subscribe();
  }

  ngAfterViewChecked(): void {
    if (this.matTable == null || this.matTable === undefined) {
      return;
    }
    const matTableOffsetTop = this.matTable['_elementRef'].nativeElement.offsetTop;
    let matHeaderRowElement;
    this.matTable['_elementRef'].nativeElement.childNodes
        .forEach(node => {
          if ((matHeaderRowElement == null || matHeaderRowElement === undefined)
              && node.tagName
              && node.tagName.toLowerCase() === 'mat-header-row') {
            matHeaderRowElement = node;
          }
        });
    const matHeaderRowElementOffsetHeight = matHeaderRowElement ? matHeaderRowElement.offsetHeight : 0;
    const windowTotalScreen = window.innerHeight;
    // this.matTable['_elementRef'].nativeElement.style.height = windowTotalScreen - matTableOffsetTop - matHeaderRowElementOffsetHeight - 10 + 'px';
  }

  sortData($event: Sort): void {
    this.sort.name = $event.active;
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    this.dataSource.loadData(
        this.sort,
        this.dataSearch.value
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
        concatMap(res => this.documentService.removeBookmark(this.sessionService.sessionToken, bookmark.entity.uid)),
      concatMap(() => this.entityCacheService.reloadBookmarks()),
      concatMap(() => this.entityCacheService.reloadEntity(bookmark.entity.uid))
    ).subscribe(
        null,
        null,
        () => this.dataSource.loadData(this.sort, this.filter)
    );
  }

    goToEntity(entity: DMEntity): void {
      this.bes.goToEntity(entity, this.router);
    }

  filterData(): void {
    this.dataSource.loadData(this.sort, this.dataSearch.value);
  }

  retrieveDocumentIcon(element: DMEntity, iconPrefix: string): string {
    return DMEntityUtils.retrieveEntityIconName(this.iconService, element, iconPrefix);
  }
}
