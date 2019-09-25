import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {ConverterService} from 'app/kimios-client-api';
import {environment} from 'environments/environment';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit {

  @Input()
  documentId: number;

  // link$: Observable<string>;
  link: SafeResourceUrl;

  constructor(
      private sessionService: SessionService,
      private converterService: ConverterService,
      private sanitizer: DomSanitizer
  ) {
    // this.link$ = new Observable<string>();

  }

  ngOnInit(): void {
    /*this.link$ = this.converterService.convertDocument(
        this.sessionService.sessionToken,
        this.documentId,
        'JodConverter',
        'pdf'
    );*/
    this.link = this.sanitizer.bypassSecurityTrustResourceUrl(this.makeApiCallForPreview(this.documentId));
  }

  private makeApiCallForPreview(docId: number): string {
    let link = environment.apiPath;
    link += '/services/rest/converter/convertDocument'
    link += '?';
    link += 'sessionId=' + this.sessionService.sessionToken;
    link += '&';
    link += 'documentId=' + docId;
    link += '&';
    link += 'converterImpl=' + 'JodConverter';
    link += '&';
    link += 'outputFormat=pdf'
    link += '&'
    link += 'inline=true';

    return link;
  }

}
