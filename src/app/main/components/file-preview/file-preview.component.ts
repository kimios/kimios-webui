import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {ConverterService, FiletransferService} from 'app/kimios-client-api';
import {environment} from 'environments/environment';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {catchError, concatMap, filter, map, switchMap, tap} from 'rxjs/operators';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {EntityCacheService} from 'app/services/entity-cache.service';

@Component({
  selector: 'file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit, OnChanges {

  @Input()
  documentId: number;
  @Input()
  documentExtension: string;
  @Input()
  documentVersionId: number;
  @Input()
  previewTitle: string;

  // link$: Observable<string>;
  link$: Subject<SafeResourceUrl>;
  fileContent$: Observable<string>;
  fileCompleteContent$: Subject<string>;
  mediaType$: BehaviorSubject<string>;

  constructor(
      private sessionService: SessionService,
      private converterService: ConverterService,
      private sanitizer: DomSanitizer,
      private fileTransferService: FiletransferService,
      private documentDetailService: DocumentDetailService,
      private entityCacheService: EntityCacheService
  ) {
    // this.link$ = new Observable<string>();
    this.fileContent$ = new Observable<string>();
    this.fileCompleteContent$ = new Subject<string>();
    this.link$ = new Subject<SafeResourceUrl>();
    this.mediaType$ = new BehaviorSubject<string>('');
  }

  ngOnInit(): void {
    /*this.link$ = this.converterService.convertDocument(
        this.sessionService.sessionToken,
        this.documentId,
        'JodConverter',
        'pdf'
    );*/
    // this.link = this.sanitizer.bypassSecurityTrustResourceUrl(this.makeApiCallForPreview(this.documentId));
    this.entityCacheService.findDocumentVersionMediaType(this.documentVersionId).pipe(
      tap(mediaType => this.mediaType$.next(mediaType)),
      tap(mediaType => console.log(mediaType))
    ).subscribe();

    let textContent = '';
    this.entityCacheService.findDocumentVersionMediaType(this.documentVersionId).pipe(
      tap(mediaType => this.mediaType$.next(mediaType)),
      tap(mediaType => console.log(mediaType)),
      filter(mediaType => this.docIsText(mediaType)),
      concatMap(() => this.fileTransferService.startDownloadTransaction(
        this.sessionService.sessionToken,
        this.documentVersionId
      )),
      concatMap(
        res => this.fileTransferService.downloadDocumentVersion(
          this.sessionService.sessionToken,
          res.uid,
          true,
        )
      ),
      switchMap(
        result => of(result).catch(error => of(error))
      ),
      catchError((error) => {
        return (error.status
          && error.status === 200
          && error.error
          && error.error.text) ?
          error.error.text :
          null;
      }),
      map(response => textContent += response)
    ).subscribe(
      null,
      null,
      () => this.fileCompleteContent$.next(textContent)
    );

    this.mediaType$.pipe(
      concatMap(mediaType => this.docNeedsConversionToPdf(mediaType) ?
        of(this.makeApiCallForPreview(this.documentId)) :
        (this.docIsPDF(mediaType) || DocumentUtils.isImage(mediaType)) ?
          this.documentDetailService.makeDownloadLink(this.documentVersionId) :
          of('')
      ),
      tap(link => this.link$.next(link))
    ).subscribe();
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    if (changes['documentVersionId'] !== null) {
      this.ngOnInit();
    }
  }

  private makeApiCallForPreview(docId: number): SafeResourceUrl {
    let link = environment.apiPath;
    link += '/services/rest/converter/convertDocument';
    link += '?';
    link += 'sessionId=' + this.sessionService.sessionToken;
    link += '&';
    link += 'documentId=' + docId;
    link += '&';
    link += 'converterImpl=' + 'JodConverter';
    link += '&';
    link += 'outputFormat=pdf';
    link += '&';
    link += 'inline=true';

    return this.sanitizer.bypassSecurityTrustResourceUrl(link);
  }

  public docIsText(mediaType: string): boolean {
    return mediaType != null && DocumentUtils.isText(mediaType);
  }

  public docNeedsConversionToPdf(mediaType: string): boolean {
      return mediaType != null && DocumentUtils.mediaTypeHasToBeConvertedToPdf(mediaType);
  }

  private docIsPDF(mediaType: string): boolean {
      return DocumentUtils.isPDF(mediaType);
  }

  private docIsImg(mediaType: string): boolean {
    return DocumentUtils.isImage(mediaType);
  }
}
