import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MailContact, SecurityService, Share, ShareService, User} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DatePipe} from '@angular/common';
import {from, Observable, Subject} from 'rxjs';
import {map, mergeMap, startWith, tap} from 'rxjs/operators';
import {ShareByEmailFullContactParam} from '../../../kimios-client-api/model/shareByEmailFullContactParam';

@Component({
  selector: 'share-form-external',
  templateUrl: './share-form-external.component.html',
  styleUrls: ['./share-form-external.component.scss']
})
export class ShareFormExternalComponent implements OnInit {

  constructor(
      private fb: FormBuilder,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private shareService: ShareService,
      private browseEntityService: BrowseEntityService,
      private datePipe: DatePipe
  ) {
    this.possibleTimeSelections = new Array<String>();

    this.shareFormGroup = this.fb.group({
      'dateUntil': this.fb.control(this.minDate.setDate(this.minDate.getDate() + 1)),
      'timeUntil': this.fb.control('0:00'),
      'email': this.fb.control(''),
      'password': this.fb.control(true),
    });
  }
  shareFormGroup: FormGroup;

  minDate: Date = new Date();

  @Input()
  documentId: number;
  @Input()
  documentName: string;
  @Input()
  share: Share;

  possibleTimeSelections: Array<String>;
  hourAndTimeDefault: string;

  events: string[] = [];

  ngOnInit(): void {
    this.minDate = new Date();
    this.fillTimeOptions();
    this.hourAndTimeDefault = '0:00';

    // if a share's is given, we are in edit mode
    // so we launch the existing share's data
    if (this.share != null
        && this.share !== undefined) {
      const expirationDate = new Date(this.share.expirationDate);
      this.shareFormGroup = this.fb.group({
        'dateUntil': this.fb.control(new Date(this.share.expirationDate)),
        'timeUntil': this.fb.control(
            this.format2digits(expirationDate.getHours().toString())
            + ':'
            + this.format2digits(expirationDate.getMinutes().toString())
        ),
        'email': this.fb.control(''),
        'password': this.fb.control(true),
      });
    }
  }

  private fillTimeOptions(): void {
    Array.from(Array(23).keys())
        .forEach((hour) =>
            Array.from(Array(4).keys())
                .forEach((quarter) => this.possibleTimeSelections.push(this.format2digits(hour.toString()) + ':' + (quarter === 0 ? '00' : quarter * 15))));
  }

  onSubmit(): void {
    if (this.shareFormGroup.invalid) {

    } else {
      if (this.share == null) {
        const recipients = new Array<MailContact>();
        [this.shareFormGroup.get('email').value].forEach(emailStr => recipients.push(<MailContact>{
          emailAddress: emailStr,
          fullName: emailStr
        }));

        this.shareService.shareByEmailFullContact_1( <ShareByEmailFullContactParam>{
          sessionId: this.sessionService.sessionToken,
          documentIds: [this.documentId],
          recipients: recipients,
          subject: 'A document has been shared with you',
          content: '__DOCUMENTSLINKS__',
          senderAddress: null,
          senderName: this.sessionService.currentUser.firstName
              + this.sessionService.currentUser.lastName,
          defaultSender: true,
          password: this.shareFormGroup.get('password').value === true ? null : '',
          expirationDate: this.formatDate(this.shareFormGroup.get('dateUntil').value, this.shareFormGroup.get('timeUntil').value)
        }).subscribe(
            res => this.browseEntityService.shareDocumentReturn$.next(true),
            error => console.log('error when sharing document')
        );
      } else {
        /*const inputDateUntilValue = this.shareFormGroup.get('dateUntil').value;
        const dateUntil = inputDateUntilValue['_d'] != null && inputDateUntilValue['_d'] !== undefined ?
            inputDateUntilValue['_d'] :
            inputDateUntilValue;

        this.shareService.updateShare(
            this.sessionService.sessionToken,
            this.share.id,
            this.shareFormGroup.get('user').value['uid'],
            this.shareFormGroup.get('user').value['source'],
            true,
            this.shareFormGroup.get('shareLevel').value === 'write'
            || this.shareFormGroup.get('shareLevel').value === 'fullAccess',
            this.shareFormGroup.get('shareLevel').value === 'fullAccess',
            this.formatDate(
                dateUntil.getTime(),
                this.shareFormGroup.get('timeUntil').value
            ),
            this.shareFormGroup.get('notify').value
        ).subscribe(
            res => this.browseEntityService.shareDocumentReturn$.next(true),
            error => console.log('error when sharing document')
        );*/
      }
    }
  }

  private formatDate(dateUntil: any, timeUntil: string): string {
    let dateStr = '';

    if (typeof dateUntil === 'number') {
      const d = new Date().setTime(dateUntil);
      dateStr = this.datePipe.transform(d, 'dd-MM-yyyy');
    } else {
      if (dateUntil['_pf']
          && dateUntil['_pf']['parsedDateParts']
          && dateUntil['_pf']['parsedDateParts'][0]
          && dateUntil['_pf']['parsedDateParts'][1]
          && dateUntil['_pf']['parsedDateParts'][2]) {
        dateStr += this.format2digits('' + dateUntil['_pf']['parsedDateParts'][2]);
        dateStr += '-';
        dateStr += this.format2digits('' + (dateUntil['_pf']['parsedDateParts'][1] + 1));
        dateStr += '-';
        dateStr += dateUntil['parsedDateParts'][0];
      } else {
        if (dateUntil['_i']
            && dateUntil['_i']['date'] != null
            && dateUntil['_i']['month'] != null
            && dateUntil['_i']['year'] != null) {
          dateStr += this.format2digits('' + dateUntil['_i']['date']);
          dateStr += '-';
          dateStr += this.format2digits('' + (dateUntil['_i']['month'] + 1));
          dateStr += '-';
          dateStr += dateUntil['_i']['year'];
        }
      }
    }

    dateStr += ' ';
    const timeUntilSplit = timeUntil.split(':');
    if (timeUntilSplit.length !== 2) {
      dateStr += '00:00';
    } else {
      dateStr += (timeUntilSplit[0].length === 1 ? '0' + timeUntilSplit[0] : timeUntilSplit[0])
          + ':'
          + (timeUntilSplit[1].length === 2 ? timeUntilSplit[1] : '00');
    }

    return dateStr;
  }

  private format2digits(str: string): string {
    return str.length === 1 ?
        '0' + str :
        str;
  }
}
