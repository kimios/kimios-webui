import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PAGE_SIZE_DEFAULT, SearchEntityService} from 'app/services/searchentity.service';
import {BehaviorSubject} from 'rxjs';
import {PageEvent} from '@angular/material';
import {isNumber} from 'util';

@Component({
  selector: 'app-search-queries',
  templateUrl: './search-queries.component.html',
  styleUrls: ['./search-queries.component.scss']
})
export class SearchQueriesComponent implements OnInit {

  allTags: Map<string, number>;

  totalFilesFound$: BehaviorSubject<number>;
  fileToUpload: File = null;

  pageSize: number;
  pageIndex: number;
  pageSizeOptions = [5, 10, 20];

  @ViewChild('kimiosContentArea') kimiosContentArea: ElementRef;
  @ViewChild('paginator') paginator: ElementRef;
  @ViewChild('fileListContainer') fileListContainer: ElementRef;

  constructor(
      private searchEntityService: SearchEntityService
  ) {
    this.totalFilesFound$ = new BehaviorSubject<number>(undefined);
    this.pageSize = PAGE_SIZE_DEFAULT;
  }

  ngOnInit(): void {
    this.searchEntityService.retrieveAllTags().subscribe(
        res => this.allTags = res
    );

    this.searchEntityService.onTotalFilesChanged.subscribe(
        res => this.totalFilesFound$.next(isNumber(res) ? res : undefined)
    );
  }

  paginatorHandler($event: PageEvent): void {
    this.searchEntityService.changePage($event.pageIndex, $event.pageSize).subscribe(
        null,
        null,
        () => {
          this.pageIndex = $event.pageIndex;
          this.pageSize = $event.pageSize;
        }
    );
  }
}
