import {Injectable} from '@angular/core';
import {DataTransaction, DocumentService, DocumentVersionService, FiletransferService, Document as KimiosDocument} from 'app/kimios-client-api';
import {Observable, of} from 'rxjs';
import {concatMap, map, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {TagService} from 'app/services/tag.service';
import {Tag} from 'app/main/model/tag';
import {APP_CONFIG} from 'app/app-config/config';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {CacheSecurityService} from 'app/services/cache-security.service';


@Injectable({
  providedIn: 'root'
})
export class DocumentDetailService {

  constructor(
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService,
      private sessionService: SessionService,
      private filetransferService: FiletransferService,
      private sanitizer: DomSanitizer,
      private cacheSecurityService: CacheSecurityService
  ) {

  }

  retrieveDocumentFromId(docId: number): Observable<KimiosDocument> {
      return this.documentService.getDocument(this.sessionService.sessionToken, docId);
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
              window.open(link.href);
          }
      );
  }

  makeDownloadLink(documentVersionId: number): Observable<SafeResourceUrl> {
      return this.startDownloadTransaction(documentVersionId)
          .pipe(
              map(
                  res => this.sanitizer.bypassSecurityTrustResourceUrl(
                      APP_CONFIG.KIMIOS_API_BASE_PATH
                      + '/filetransfer/downloadDocumentVersion?sessionId='
                      + this.sessionService.sessionToken
                      + '&transactionId='
                      + res.uid
                      + '&inline=true'
                  )
              )
          );
  }

  checkIn(documentId: number): Observable<any> {
      return this.documentService.checkinDocument(this.sessionService.sessionToken, documentId).pipe(
          concatMap(result => {
              this.cacheSecurityService.invalidLockEntry(documentId);
              return of(result);
          })
      );
  }

    checkOut(documentId: number): Observable<any> {
        return this.documentService.checkoutDocument(this.sessionService.sessionToken, documentId).pipe(
            concatMap(result => {
                this.cacheSecurityService.invalidLockEntry(documentId);
                return of(result);
            })
        );
    }
}
