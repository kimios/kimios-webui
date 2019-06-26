import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {DMEntitySecurity, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Observable, of} from 'rxjs';
import {DataSource} from '@angular/cdk/table';
import {CollectionViewer} from '@angular/cdk/collections';
import {ColumnDescriptionWithElement} from 'app/main/model/column-description-with-element';
import {map, tap} from 'rxjs/operators';

@Component({
  selector: 'file-security',
  templateUrl: './file-security.component.html',
  styleUrls: ['./file-security.component.scss']
})
export class FileSecurityComponent implements OnInit {

  @Input()
  documentId: number;

  dmEntitySecuritiesForm: FormGroup;
  formArray$: Observable<AbstractControl[]>;

  dataSource: DmEntitySecurityDataSource;
  columnsDescription: ColumnDescriptionWithElement[] = DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [];

  constructor(
      private fb: FormBuilder,
      private securityService: SecurityService,
      private sessionService: SessionService
  ) {
    this.dmEntitySecuritiesForm = this.fb.group({
      formArray: this.fb.array([])
    });
    this.columnsDescription.forEach((elem) => {
      this.displayedColumns.push(elem.matHeaderCellDef);
    });
    this.formArray$ = new Observable<AbstractControl[]>();
  }

  ngOnInit(): void {
    this.dataSource = new DmEntitySecurityDataSource(
        this.securityService,
        this.sessionService,
        this.documentId
    );

    this.dataSource.dmEntitySecurities
        .pipe(
            map(
                res => {
                  if (res && res.length > 0) {
                    const fa = this.fb.array([]);
                    res.forEach( security =>
                        fa.push(
                            this.fb.group({
                              'read': this.fb.control(security.read),
                              'write': this.fb.control(security.write),
                              'fullAccess': this.fb.control(security.fullAccess)
                            }))
                    );
                    this.dmEntitySecuritiesForm.setControl('formArray', fa);
                    this.formArray$ = of(fa.controls);
                  }
                }
            )
        );
  }

}

class DmEntitySecurityDataSource extends DataSource<any> {

  private _dmEntitySecurities: Observable<Array<DMEntitySecurity>>;

  constructor(
      private securityService: SecurityService,
      private sessionService: SessionService,
      private documentId: number
  ) {
    super();
    this._dmEntitySecurities = new Observable<Array<DMEntitySecurity>>();
  }

  get dmEntitySecurities(): Observable<Array<DMEntitySecurity>> {
    return this._dmEntitySecurities;
  }

  connect(collectionViewer: CollectionViewer): Observable<DMEntitySecurity[]> {
    return this.securityService.getDMEntitySecurities(
        this.sessionService.sessionToken,
        this.documentId
    )
        .pipe(
            tap(res => this._dmEntitySecurities = of(res))
        );
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }

}

const DEFAULT_DISPLAYED_COLUMNS: ColumnDescriptionWithElement[] = [
  {
    // group or person
    id: 'type',
    matColumnDef: 'type',
    position: 2,
    matHeaderCellDef: 'type',
    sticky: false,
    displayName: '',
    cell: null,
    element: 'icon',
    class: 'mat-column-width100'
  },
  {
    id: 'name',
    matColumnDef: 'name',
    position: 3,
    matHeaderCellDef: 'name',
    sticky: false,
    displayName: 'Who',
    cell: (row: DMEntitySecurity) => row.fullName + ' (' + row.name + '@' + row.source + ')',
    element: 'span',
    class: 'mat-column-width200'
  },
  {
    id: 'read',
    matColumnDef: 'read',
    position: 2,
    matHeaderCellDef: 'read',
    sticky: false,
    displayName: 'read',
    cell: null,
    element: 'checkbox',
    class: 'mat-column-width100'
  },
  {
    id: 'write',
    matColumnDef: 'write',
    position: 2,
    matHeaderCellDef: 'write',
    sticky: false,
    displayName: 'write',
    cell: null,
    element: 'checkbox',
    class: 'mat-column-width100'
  },
  {
    id: 'fullAccess',
    matColumnDef: 'fullAccess',
    position: 2,
    matHeaderCellDef: 'fullAccess',
    sticky: false,
    displayName: 'full',
    cell: null,
    element: 'checkbox',
    class: 'mat-column-width100'
  }
];
