import {Injectable} from '@angular/core';
import {DataTransaction, DocumentService, DocumentVersionService, FiletransferService} from 'app/kimios-client-api';
import {Observable} from 'rxjs';
import {concatMap, map, tap} from 'rxjs/operators';
import {SessionService} from './session.service';
import {TagService} from './tag.service';
import {Tag} from 'app/main/model/tag';
import {APP_CONFIG} from 'app/app-config/config';


@Injectable({
  providedIn: 'root'
})
export class DocumentDetailService {

  constructor(
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService,
      private sessionService: SessionService,
      private filetransferService: FiletransferService
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

  startDownloadTransaction(documentVersionId: number): Observable<DataTransaction> {
      return this.filetransferService.startDownloadTransaction(this.sessionService.sessionToken, documentVersionId)
          .pipe(
              tap(res => console.log(res))
          );
  }

  downloadDocumentVersion(documentVersionId: number): void {
      this.startDownloadTransaction(documentVersionId).subscribe(
          res => {
              const link = document.createElement('a');
              link.href = APP_CONFIG.KIMIOS_API_BASE_PATH
                  + '/filetransfer/downloadDocumentVersion?sessionId='
                  + this.sessionService.sessionToken
                  + '&transactionId='
                  + res.uid
                  + '&inline=false';
              link.click();
          }
      );
  }
}
