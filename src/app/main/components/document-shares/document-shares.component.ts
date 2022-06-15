import {Component, OnDestroy, OnInit} from '@angular/core';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {Document as KimiosDocument} from 'app/kimios-client-api/model/document';
import {concatMap, filter, takeWhile, tap} from 'rxjs/operators';
import {DocumentDetailService} from 'app/services/document-detail.service';

@Component({
  selector: 'document-shares',
  templateUrl: './document-shares.component.html',
  styleUrls: ['./document-shares.component.scss']
})
export class DocumentSharesComponent implements OnInit, OnDestroy {

  documentId: number;
  subscriptionOk = true;
  kimiosDocument: KimiosDocument;

  constructor(
    private entityCacheService: EntityCacheService,
    private documentDetailService: DocumentDetailService
  ) {

  }

  ngOnInit(): void {
    this.documentDetailService.currentDocumentId$.pipe(
      takeWhile(next => this.subscriptionOk),
      filter(docId => docId != null && docId !== undefined),
      tap(docId => this.documentId = docId),
      concatMap(docId => this.entityCacheService.findEntityInCache(docId)),
        tap(next => this.kimiosDocument = next)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptionOk = false;
  }
}
