import {Injectable} from '@angular/core';
import {DataTransaction, Document as KimiosDocument, DocumentService, DocumentVersionService, FiletransferService} from 'app/kimios-client-api';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {concatMap, map, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {APP_CONFIG} from 'app/app-config/config';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {CacheSecurityService} from 'app/services/cache-security.service';


@Injectable({
  providedIn: 'root'
})
export class DocumentDetailService {

  currentVersionId: BehaviorSubject<number>;
  currentDocumentId$: BehaviorSubject<number>;
  currentPath$: BehaviorSubject<string>;
  selectedEntityIdList$: BehaviorSubject<Array<number>>;

  constructor(
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService,
      private sessionService: SessionService,
      private filetransferService: FiletransferService,
      private sanitizer: DomSanitizer,
      private cacheSecurityService: CacheSecurityService
  ) {
      this.currentVersionId = new BehaviorSubject<number>(null);
      this.currentDocumentId$ = new BehaviorSubject<number>(null);
      this.currentPath$ = new BehaviorSubject<string>('');
      this.selectedEntityIdList$ = new BehaviorSubject<Array<number>>(null);
  }

  startDownloadTransaction(documentVersionId: number): Observable<DataTransaction> {
      return this.filetransferService.startDownloadTransaction(this.sessionService.sessionToken, documentVersionId)
          .pipe(
              // tap(res => console.log(res))
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

    addBookmark(documentId: number): Observable<any> {
      return this.documentService.addBookmark(this.sessionService.sessionToken, documentId);
    }

    removeBookmark(documentId: number): Observable<any> {
      return this.documentService.removeBookmark(this.sessionService.sessionToken, documentId);
    }
}
