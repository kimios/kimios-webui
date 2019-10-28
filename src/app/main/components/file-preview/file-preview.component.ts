import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {ConverterService, FiletransferService} from 'app/kimios-client-api';
import {environment} from 'environments/environment';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Observable, of} from 'rxjs';
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators';
import {DocumentDetailService} from 'app/services/document-detail.service';

const textExtensions = ['txt', 'java', 'cs', 'js', 'cpp', 'c', 'cc', 'html', 'log', 'sql', 'py', 'xml', 'java', 'eml', 'pl', 'caml'
  , 'css', 'scss', 'sh', 'bat'];
const extensionsToBeConvertedToPdf = ['odt', 'odp', 'xls', 'xlsx', 'docx', 'doc'];
const imgExtensions = ['png', 'jpg', 'jpeg', 'tif', 'tiff', 'gif', 'pdf'];

const viewableExtensions = ['asciidoc', 'adoc', 'ps']
    .concat(textExtensions)
    .concat(extensionsToBeConvertedToPdf)
    .concat(imgExtensions);

@Component({
  selector: 'file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit {

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
    )

    this.link$ = this.docNeedsConversionToPdf(this.documentExtension) ?
        of(this.makeApiCallForPreview(this.documentId)) :
        (this.documentExtension.toLowerCase() === 'pdf' || imgExtensions.includes(this.documentExtension.toLowerCase())) ?
            this.documentDetailService.makeDownloadLink(this.documentVersionId) :
            of('');
  }

  private makeApiCallForPreview(docId: number): SafeResourceUrl {
    let link = environment.apiPath;
    link += '/services/rest/converter/convertDocument'
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

  private docIsTextFormat(docExtension: string): boolean {
    return textExtensions.includes(docExtension.toLowerCase());
  }

  private docNeedsConversionToPdf(docExtension: string): boolean {
    return extensionsToBeConvertedToPdf.includes(docExtension.toLowerCase());
  }

  private docIsImg(docExtension: string): boolean {
    return imgExtensions.includes(docExtension.toLowerCase());
  }
}
