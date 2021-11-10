import {Component, Input, OnInit} from '@angular/core';
import {DocumentVersion} from 'app/kimios-client-api';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {DocumentVersionWithMetaValues} from 'app/main/model/entity-cache-data';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'document-version-data',
  templateUrl: './document-version-data.component.html',
  styleUrls: ['./document-version-data.component.scss']
})
export class DocumentVersionDataComponent implements OnInit {

  @Input()
  documentVersion: DocumentVersion;
  documentVersionWithMetaDataValues: DocumentVersionWithMetaValues;
  documentVersionWithMetaDataValues$: Observable<DocumentVersionWithMetaValues>;

  constructor(
    private ecs: EntityCacheService
  ) {

  }

  ngOnInit(): void {
    this.documentVersionWithMetaDataValues$ = this.ecs.findDocumentVersionWithMetaDataValues(this.documentVersion.documentUid, this.documentVersion.uid).pipe(
      tap(documentVersionWithMetaDataValues => this.documentVersionWithMetaDataValues)
    );
  }

}
