import {Component, Input, OnInit} from '@angular/core';
import {concatMap, filter, map, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {DMEntityWrapper} from '../../../kimios-client-api/model/dMEntityWrapper';

@Component({
  selector: 'file-detail-data-and-tags',
  templateUrl: './file-detail-data-and-tags.component.html',
  styleUrls: ['./file-detail-data-and-tags.component.scss']
})
export class FileDetailDataAndTagsComponent implements OnInit {

  @Input()
  documentId: number;
  documentId$: BehaviorSubject<number>;
  documentWrapper$: BehaviorSubject<DMEntityWrapper>;

  constructor(
    private entityCacheService: EntityCacheService,
    private documentDetailService: DocumentDetailService
  ) {
    this.documentId$ = new BehaviorSubject<number>(null);
    this.documentWrapper$ = new BehaviorSubject<DMEntityWrapper>(null);
  }

  ngOnInit(): void {
    this.documentId$.pipe(
      filter(docId => docId != null),
      concatMap(docId => this.entityCacheService.findDocumentInCache(docId)),
      tap(res => this.documentWrapper$.next(res))
    ).subscribe();

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

    this.entityCacheService.documentUpdate$.pipe(
      filter(docId => docId === this.documentId),
      concatMap(docId => this.entityCacheService.findDocumentInCache(docId)),
      tap(res => this.documentWrapper$.next(res))
    ).subscribe();
  }

}
