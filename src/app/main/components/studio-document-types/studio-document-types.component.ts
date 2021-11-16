import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
export class StudioDocumentTypesComponent implements OnInit, AfterViewChecked {

  docTypes$: BehaviorSubject<Array<DocumentType>>;

  @ViewChild('divider',  { read: ElementRef }) divider: ElementRef;

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
    this.adminService.newDocumentType$.next(false);
    this.adminService.selectedDocumentType$.next(docType.uid);
  }

  handleCreateDocumentType(): void {
    this.adminService.selectedDocumentType$.next(0);
    this.adminService.newDocumentType$.next(true);
  }

  removeDocumentType(uid: number): void {
    this.studioService.deleteDocumentType(this.sessionService.sessionToken, uid).pipe(
        tap(() => this.adminService.needRefreshDocumentTypes$.next(true))
    ).subscribe();
  }

  ngAfterViewChecked(): void {
    const previousSiblingHeight = this.divider.nativeElement.previousSibling.clientHeight;
    const nextSiblingHeight = this.divider.nativeElement.nextSibling.clientHeight ?
      this.divider.nativeElement.nextSibling.clientHeight :
      0;
    const dividerHeight = Math.max(previousSiblingHeight, nextSiblingHeight);
    this.divider.nativeElement.style.height = dividerHeight + 'px';
  }
}
