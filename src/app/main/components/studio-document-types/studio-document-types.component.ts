import {Component, OnInit} from '@angular/core';
import {DocumentType, StudioService} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {Observable} from 'rxjs';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'studio-document-types',
  templateUrl: './studio-document-types.component.html',
  styleUrls: ['./studio-document-types.component.scss']
})
export class StudioDocumentTypesComponent implements OnInit {

  docTypes$: Observable<Array<DocumentType>>;

  constructor(
      private studioService: StudioService,
      private adminService: AdminService,
      private sessionService: SessionService
  ) {
    this.docTypes$ = studioService.getDocumentTypes(sessionService.sessionToken);
  }

  ngOnInit(): void {

  }

  selectDocType(docType: DocumentType): void {
    this.adminService.selectedDocumentType$.next(docType.uid);
  }
}
