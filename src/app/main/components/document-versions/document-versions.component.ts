import {Component, Input, OnInit} from '@angular/core';
import {DocumentVersion} from 'app/kimios-client-api';
import {DocumentDetailService} from '../../../services/document-detail.service';
import {filter, tap} from 'rxjs/operators';

@Component({
  selector: 'document-versions',
  templateUrl: './document-versions.component.html',
  styleUrls: ['./document-versions.component.scss']
})
export class DocumentVersionsComponent implements OnInit {

  @Input()
  versionList: Array<DocumentVersion>;

  currentVersionId = 0;

  constructor(
      private documentDetailService: DocumentDetailService
  ) {

  }

  ngOnInit(): void {
    this.documentDetailService.currentVersionId.pipe(
        filter(currentVersionId => currentVersionId != null),
        tap(currentVersionId => this.currentVersionId = currentVersionId)
    ).subscribe();
  }

  handleVersionDownload(versionId: number): void {
    this.documentDetailService.downloadDocumentVersion(versionId);
  }

  handleVersionPreview(uid: number): void {
    this.documentDetailService.currentVersionId.next(uid);
  }
}
