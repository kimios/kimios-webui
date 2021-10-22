import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {Document as KimiosDocument, DocumentService} from 'app/kimios-client-api';
import {tap} from 'rxjs/operators';
import {KimiosDocumentDataSource} from '../../model/kimios-document-data-source';

@Component({
  selector: 'related-documents',
  templateUrl: './related-documents.component.html',
  styleUrls: ['./related-documents.component.scss']
})
export class RelatedDocumentsComponent implements OnInit {

  @Input()
  documentUid: number;
  relatedDocuments: Array<KimiosDocument>;
  dataSource: KimiosDocumentDataSource;

  constructor(
      private sessionService: SessionService,
      private documentService: DocumentService
  ) {
    this.dataSource = new KimiosDocumentDataSource();
  }

  ngOnInit(): void {
    this.documentService.getRelatedDocuments(this.sessionService.sessionToken, this.documentUid).pipe(
        tap(docs => this.relatedDocuments = docs),
        tap(docs => this.dataSource.se)
    ).subscribe();
  }

}
