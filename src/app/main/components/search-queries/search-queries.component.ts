import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {SearchEntityService} from 'app/services/searchentity.service';
import {BehaviorSubject} from 'rxjs';
import {PageEvent} from '@angular/material';
import {isNumber} from 'util';
import {ActivatedRoute} from '@angular/router';
import {EntityCacheService} from 'app/services/entity-cache.service';

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

  @Input()
  docNameSearch: string;

  @ViewChild('kimiosContentArea') kimiosContentArea: ElementRef;
  @ViewChild('paginator') paginator: ElementRef;
  @ViewChild('fileListContainer') fileListContainer: ElementRef;


  constructor(
      private searchEntityService: SearchEntityService,
      private route: ActivatedRoute,
      private entityCacheService: EntityCacheService
  ) {
    this.totalFilesFound$ = new BehaviorSubject<number>(undefined);
    this.pageSize = this.searchEntityService.pageSize;
  }

  ngOnInit(): void {
    this.entityCacheService.findAllTags().subscribe(
        res => this.allTags = res
    );

    this.searchEntityService.onTotalFilesChanged.subscribe(
        res => this.totalFilesFound$.next(isNumber(res) ? res : undefined)
    );

    this.docNameSearch = this.route.snapshot.paramMap.get('docNameSearch');
    if (this.docNameSearch != null
      && this.docNameSearch !== undefined) {

    }
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
