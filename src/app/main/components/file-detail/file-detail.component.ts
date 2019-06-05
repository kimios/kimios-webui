import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Document as KimiosDocument, DocumentService, DocumentVersion, DocumentVersionService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'file-detail',
  templateUrl: './file-detail.component.html',
  styleUrls: ['./file-detail.component.scss']
})
export class FileDetailComponent implements OnInit {

  @Input()
  documentId: number;
  documentData$: Observable<KimiosDocument>;
  documentVersions$: Observable<Array<DocumentVersion>>;

  constructor(
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService,
      private sessionService: SessionService,
  ) {

  }

  ngOnInit(): void {
    this.documentData$ = this.documentService.getDocument(this.sessionService.sessionToken, this.documentId);
    this.documentVersions$ = this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, this.documentId);
  }

}
