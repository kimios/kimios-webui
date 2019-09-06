import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {DMEntitySecurity, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Observable} from 'rxjs';
import {ColumnDescriptionWithElement} from 'app/main/model/column-description-with-element';
import {MatTableDataSource} from '@angular/material';

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

  dataSource: MatTableDataSource<DMEntitySecurity>;
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
    this.dataSource = new MatTableDataSource<DMEntitySecurity>([]);

    this.loadData().subscribe(
        res => {
          if (res && res.length > 0) {
            this.dmEntitySecuritiesForm.setControl('formArray', this.createFormArray(res));
          }
          this.dataSource.data = res;
        }
    );
  }

  private loadData(): Observable<Array<DMEntitySecurity>> {
    return this.securityService.getDMEntitySecurities(
        this.sessionService.sessionToken,
        this.documentId
    );
  }

  deleteRow(rowIndex: number, event): void {
    (this.dmEntitySecuritiesForm.get('formArray') as FormArray).removeAt(rowIndex);
    event.target.closest('mat-row').remove();
  }

  cancel(): void {
    this.loadData().subscribe(
        res => {
          if (res && res.length > 0) {
            this.dmEntitySecuritiesForm.setControl('formArray', this.createFormArray(res));
          }
          this.dataSource.data = res;
        }
    );
  }

  private createFormArray(dmSecurityRules: Array<DMEntitySecurity>): FormArray {
    const fa = this.fb.array([]);
    dmSecurityRules.forEach( security =>
        fa.push(
            this.fb.group({
              'read': this.fb.control(security.read),
              'write': this.fb.control(security.write),
              'fullAccess': this.fb.control(security.fullAccess)
            }))
    );
    return fa;
  }

  submit(): void {

  }
}

const DEFAULT_DISPLAYED_COLUMNS: ColumnDescriptionWithElement[] = [
  {
    // to delete this row
    id: 'actionRemove',
    matColumnDef: 'actionRemove',
    position: 1,
    matHeaderCellDef: 'actionRemove',
    sticky: false,
    displayName: '',
    cell: 'remove',
    element: 'iconName',
    class: 'mat-column-width50',
  },
  {
    // group or person
    id: 'type',
    matColumnDef: 'type',
    position: 2,
    matHeaderCellDef: 'type',
    sticky: false,
    displayName: '',
    cell: (row: DMEntitySecurity): string => row.type === 1 ? 'person' : 'group',
    element: 'iconFunction',
    class: 'mat-column-width100',
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
