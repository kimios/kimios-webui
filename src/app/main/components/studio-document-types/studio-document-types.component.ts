import {Component, OnInit} from '@angular/core';
import {DocumentType, StudioService} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {BehaviorSubject} from 'rxjs';
import {SessionService} from 'app/services/session.service';
import {concatMap, filter, tap} from 'rxjs/operators';

@Component({
  selector: 'studio-document-types',
  templateUrl: './studio-document-types.component.html',
  styleUrls: ['./studio-document-types.component.scss']
})
export class StudioDocumentTypesComponent implements OnInit {

  docTypes$: BehaviorSubject<Array<DocumentType>>;

  constructor(
      private studioService: StudioService,
      private adminService: AdminService,
      private sessionService: SessionService,
  ) {
    this.docTypes$ = new BehaviorSubject<Array<DocumentType>>(null);
  }

  ngOnInit(): void {
    this.studioService.getDocumentTypes(this.sessionService.sessionToken).subscribe(
        res => this.docTypes$.next(res)
    );

    this.adminService.needRefreshDocumentTypes$.pipe(
        filter(val => val === true),
        concatMap(() => this.studioService.getDocumentTypes(this.sessionService.sessionToken)),
        tap(documentTypes => this.docTypes$.next(documentTypes))
    ).subscribe();
  }

  selectDocType(docType: DocumentType): void {
    this.adminService.selectedDocumentType$.next(docType.uid);
  }

  handleCreateDocumentType(): void {
    this.adminService.selectedDocumentType$.next(0);
    this.adminService.newDocumentType$.next(true);
  }
}
