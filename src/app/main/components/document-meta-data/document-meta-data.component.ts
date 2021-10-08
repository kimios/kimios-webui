import {Component, Input, OnInit} from '@angular/core';
import {DocumentService, DocumentType as KimiosDocumentType, DocumentVersionService, MetaValue} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {concatMap, filter, tap} from 'rxjs/operators';

@Component({
  selector: 'document-meta-data',
  templateUrl: './document-meta-data.component.html',
  styleUrls: ['./document-meta-data.component.scss']
})
export class DocumentMetaDataComponent implements OnInit {

  @Input()
  documentId: number;
  documentType: KimiosDocumentType;
  documentMetas: Array<MetaValue>;

  constructor(
      private sessionService: SessionService,
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService
  ) {
    this.documentMetas = new Array<MetaValue>();
    this.documentType = null;
  }

  ngOnInit(): void {
    this.documentVersionService.getLastDocumentVersion(this.sessionService.sessionToken, this.documentId).pipe(
        filter(docVersion => docVersion.documentTypeUid != null && docVersion.documentTypeUid !== undefined),
        concatMap(docVersion => this.documentVersionService.getMetaValues(this.sessionService.sessionToken, docVersion.uid)
        ),
        filter(metaValues => metaValues != null),
        tap(metaValues => this.documentMetas = metaValues)
    ).subscribe();
  }

}
