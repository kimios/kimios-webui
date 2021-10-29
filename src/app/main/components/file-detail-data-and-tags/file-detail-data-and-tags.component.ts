import {Component, Input, OnInit} from '@angular/core';
import {concatMap, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {ActivatedRoute} from '@angular/router';
import {Document as KimiosDocument} from 'app/kimios-client-api';

@Component({
  selector: 'file-detail-data-and-tags',
  templateUrl: './file-detail-data-and-tags.component.html',
  styleUrls: ['./file-detail-data-and-tags.component.scss']
})
export class FileDetailDataAndTagsComponent implements OnInit {

  @Input()
  documentId: number;
  documentId$: BehaviorSubject<number>;
  document$: Observable<KimiosDocument>;

  constructor(
    private entityCacheService: EntityCacheService,
    private route: ActivatedRoute
  ) {
    this.documentId$ = new BehaviorSubject<number>(null);
  }

  ngOnInit(): void {
    this.document$ = this.documentId$.pipe(
      concatMap(docId => this.entityCacheService.findDocumentInCache(docId)),
    );

    if (this.documentId == null) {
      this.route.paramMap.pipe(
        switchMap(params => {
          this.documentId = Number(params.get('documentId'));
          return of(this.documentId);
        }),
        tap(docId => this.documentId$.next(docId))
      ).subscribe();
    } else {
      this.documentId$.next(this.documentId);
    }
  }

}
