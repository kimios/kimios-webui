import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {ConverterService, FiletransferService} from 'app/kimios-client-api';
import {environment} from 'environments/environment';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Observable, of} from 'rxjs';
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {DocumentUtils} from 'app/main/utils/document-utils';

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
  link$: Observable<SafeResourceUrl>;
  fileContent$: Observable<string>;
  fileCompleteContent$: Observable<string>;

  constructor(
      private sessionService: SessionService,
      private converterService: ConverterService,
      private sanitizer: DomSanitizer,
      private fileTransferService: FiletransferService,
      private documentDetailService: DocumentDetailService
  ) {
    // this.link$ = new Observable<string>();
    this.fileContent$ = new Observable<string>();
    this.fileCompleteContent$ = new Observable<string>();
    this.link$ = new Observable<SafeResourceUrl>();
  }

  ngOnInit(): void {
    /*this.link$ = this.converterService.convertDocument(
        this.sessionService.sessionToken,
        this.documentId,
        'JodConverter',
        'pdf'
    );*/
    // this.link = this.sanitizer.bypassSecurityTrustResourceUrl(this.makeApiCallForPreview(this.documentId));
    this.fileContent$ = this.docIsTextFormat(this.documentExtension) ?
        this.fileTransferService.startDownloadTransaction(
            this.sessionService.sessionToken,
            this.documentVersionId
        ).pipe(
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
              console.log('we catched the error !');
              console.log(error);
              return (error.status
                  && error.status === 200
                  && error.error
                  && error.error.text) ?
                  error.error.text :
                  null;
            }),
            map(
                response => response
            )
        ) :
        of();
    let content = '';
    this.fileContent$.subscribe(
        (res) => content += res,
        (error) => null,
        () => this.fileCompleteContent$ = of(content)
    );

    this.link$ = this.docNeedsConversionToPdf(this.documentExtension) ?
        of(this.makeApiCallForPreview(this.documentId)) :
        (this.documentExtension.toLowerCase() === 'pdf' || DocumentUtils.extensionIsImg(this.documentExtension.toLowerCase())) ?
            this.documentDetailService.makeDownloadLink(this.documentVersionId) :
            of('');
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

  public docIsTextFormat(docExtension: string): boolean {
    return DocumentUtils.extensionIsText(docExtension);
  }

  public docNeedsConversionToPdf(docExtension: string): boolean {
      return DocumentUtils.extensionHasToBeConvertedToPdf(docExtension.toLowerCase());
  }

  private docIsImg(docExtension: string): boolean {
      return DocumentUtils.extensionIsImg(docExtension.toLowerCase());
  }
}
