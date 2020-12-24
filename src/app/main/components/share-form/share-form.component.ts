import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SecurityService, ShareService, User} from 'app/kimios-client-api';
import {from, Observable, Subject} from 'rxjs';
import {SessionService} from 'app/services/session.service';
import {map, mergeMap, startWith} from 'rxjs/operators';
import {BrowseEntityService} from 'app/services/browse-entity.service';


@Component({
  selector: 'share-form',
  templateUrl: './share-form.component.html',
  styleUrls: ['./share-form.component.scss'],
})
export class ShareFormComponent implements OnInit {
  shareFormGroup: FormGroup;

  minDate: Date;

  @Input()
  documentId: number;
  @Input()
  documentName: string;

  possibleTimeSelections: Array<String>;
  hourAndTimeDefault: string;

  users$: Observable<User[]>;
  filteredUsers$: Observable<User[]>;
  users: User[];
  filter$: Subject<string>;

  constructor(
      private fb: FormBuilder,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private shareService: ShareService,
      private browseEntityService: BrowseEntityService
  ) {
    this.possibleTimeSelections = new Array<String>();
    this.filteredUsers$ = new Observable<User[]>();
    this.filter$ = new Subject<string>();
    this.users$ = this.securityService.getAuthenticationSources()
        .pipe(
            mergeMap(
                (result) => from(result)
            ),
            mergeMap(
                source =>
                    this.securityService.getUsers(this.sessionService.sessionToken, source.name)
            )
        );
  }

  ngOnInit(): void {
    this.minDate = new Date();
    this.fillTimeOptions();
    this.hourAndTimeDefault = '0:00';

    this.shareFormGroup = this.fb.group({
      dateUntil: this.fb.control(this.minDate.setDate(this.minDate.getDate() + 1)),
      timeUntil: this.fb.control('0:00'),
      user: this.fb.control(''),
      shareLevel: this.fb.control(''),
      notify: this.fb.control(true)
    });

    this.users$.subscribe(
        res => {
          this.users = res;
          this.filteredUsers$ = this.filter$
              .pipe(
                  startWith(''),
                  map(value => value === '' ? this.users.slice() : this._filter(value))
              );
        }
    );

    this.shareFormGroup.get('user').valueChanges
        .subscribe(
            res => this.filter$.next(res)
        );

  }

  private fillTimeOptions(): void {
    Array.from(Array(23).keys())
        .forEach((hour) =>
            Array.from(Array(4).keys())
                .forEach((quarter) => this.possibleTimeSelections.push(hour + ':' + (quarter === 0 ? '00' : quarter * 15))));
  }

  onSubmit(): void {
    if (this.shareFormGroup.invalid) {

    } else {
        this.shareService.shareDocument(
            this.sessionService.sessionToken,
            this.documentId,
            this.shareFormGroup.get('user').value['uid'],
            this.shareFormGroup.get('user').value['source'],
            true,
            this.shareFormGroup.get('shareLevel').value === 'write'
            || this.shareFormGroup.get('shareLevel').value === 'fullAccess',
            this.shareFormGroup.get('shareLevel').value === 'fullAccess',
            this.formatDate(this.shareFormGroup.get('dateUntil').value, this.shareFormGroup.get('timeUntil').value),
            this.shareFormGroup.get('notify').value
        ).subscribe(
            null,
            error => console.log('error when sharing document'),
            () => this.browseEntityService.shareDocumentReturn$.next(true)
        );

    }
  }

  private _filter(value: string | User): User[] {
    let filterValue;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      return this.users;
    }

    return this.users ? this.users.filter(user => this.displayFn(user).toLowerCase().includes(filterValue)) : this.users;
  }

  displayFn(user?: User): string | undefined {
    return user ? user.name + ', ' + user.firstName + ' (' + user.uid + '@' + user.source + ')' : undefined;
  }

  selected(): void {
    this.filter$.next('');
  }

  private formatDate(dateUntil: Date, timeUntil: string): string {
    let dateStr = '';

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
