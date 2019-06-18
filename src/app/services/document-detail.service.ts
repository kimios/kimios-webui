import { Injectable } from '@angular/core';
import {DocumentService, DocumentVersion, DocumentVersionService} from '../kimios-client-api';
import {Observable} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {SessionService} from './session.service';
import {TagService} from './tag.service';
import {Tag} from '../main/model/tag';


@Injectable({
  providedIn: 'root'
})
export class DocumentDetailService {

  constructor(
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService,
      private sessionService: SessionService
  ) {

  }

  retrieveDocumentDetails(docId: number): void {
    this.documentService.getDocument(this.sessionService.sessionToken, docId)
        .pipe(
            concatMap(res => this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, docId))
        );
  }

  retrieveDocumentTags(docId: number): Observable<Tag[]> {
    return this.documentVersionService.getLastDocumentVersion(this.sessionService.sessionToken, docId)
        .pipe(
            concatMap(next => this.documentVersionService.getMetaValues(this.sessionService.sessionToken, next.uid)),
            map(res =>
                res.filter(mv => mv.meta.name.startsWith(TagService.TAG_NAME_PREFIX)
                    && mv.value == mv.meta.uid)
                    .map(mv => new Tag(mv.meta.name.replace(new RegExp('^' + TagService.TAG_NAME_PREFIX), ''), mv.metaId))
            )
        );
  }
}
