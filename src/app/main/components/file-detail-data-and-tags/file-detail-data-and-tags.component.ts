import {Component, Input, OnInit} from '@angular/core';
import {concatMap, filter, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {DocumentDetailService} from 'app/services/document-detail.service';

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
    private documentDetailService: DocumentDetailService
  ) {
    this.documentId$ = new BehaviorSubject<number>(null);
  }

  ngOnInit(): void {
    this.document$ = this.documentId$.pipe(
      filter(docId => docId != null),
      concatMap(docId => this.entityCacheService.findDocumentInCache(docId)),
    );

    if (this.documentId == null) {
      this.documentDetailService.currentDocumentId$.pipe(
        filter(docId => docId != null),
        tap(docId => this.documentId = docId),
        tap(docId => this.documentId$.next(docId))
      ).subscribe();
    } else {
      this.documentId$.next(this.documentId);
    }

    this.entityCacheService.documentUpdate$.pipe(
      filter(docId => this.documentId != null && this.documentId === docId),
      tap(docId => this.documentId$.next(docId))
    ).subscribe();
  }

}
