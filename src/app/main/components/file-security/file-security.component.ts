import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {DMEntitySecurity, SecurityService, UpdateSecurityCommand} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Observable} from 'rxjs';
import {ColumnDescriptionWithElement} from 'app/main/model/column-description-with-element';
import {MatDialog, MatTableDataSource} from '@angular/material';
import {map} from 'rxjs/operators';
import {UsersAndGroupsSelectionDialogComponent} from 'app/main/components/users-and-groups-selection-dialog/users-and-groups-selection-dialog.component';
import {UserOrGroup} from 'app/main/components/users-and-groups-selection-panel/users-and-groups-selection-panel.component';

export interface DialogData {
    selectedUsersAndGroups: Array<UserOrGroup>;
}

const DMENTITYTYPE_DOCUMENT = 3;
const enum SECURITY_ENTITY_TYPE {
    USER = 1,
    GROUP = 2
}

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
  showSpinner = true;

  constructor(
      private fb: FormBuilder,
      private securityService: SecurityService,
      private sessionService: SessionService,
      public dialog: MatDialog
  ) {
    this.dmEntitySecuritiesForm = this.fb.group({
      formGroupSecurities: this.fb.group({})
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
            this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(res));
          }
          this.dataSource.data = res;
          this.showSpinner = false;
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
      this.dataSource.data.splice(rowIndex, 1);
      const newData = this.dataSource.data.slice();
      this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(newData));
      this.dataSource.data = newData;
  }

    cancel($event: MouseEvent): void {
      $event.stopPropagation();
      $event.preventDefault();
    this.showSpinner = true;
    this.loadData().subscribe(
        res => {
          if (res && res.length > 0) {
            this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(res));
          }
          this.dataSource.data = res;
          this.showSpinner = false;
        }
    );
  }

    private createFormGroup(dmSecurityRules: Array<DMEntitySecurity>): FormGroup {
        const fg = this.fb.group([]);
        dmSecurityRules.forEach( (security, index) =>
            fg.addControl(
                index.toString(),
                this.createSecurityFormGroup(security)
            )
        );
        return fg;
    }

    private createSecurityFormGroup(security: DMEntitySecurity): FormGroup {
        return this.fb.group({
            'name': security.name,
            'source': security.source,
            'type': security.type,
            'read': security.read,
            'write': security.write,
            'fullAccess': security.fullAccess
        });
    }

    submit($event: MouseEvent): void {
        $event.stopPropagation();
        $event.preventDefault();

        this.showSpinner = true;
      const updateSecurityCommand = <UpdateSecurityCommand> {
          sessionId: this.sessionService.sessionToken,
          dmEntityId: this.documentId,
          appendMode: true,
          securities: Object.keys((this.dmEntitySecuritiesForm.get('formGroupSecurities') as FormGroup).controls).map(control =>
              <DMEntitySecurity> {
                  dmEntityUid: this.documentId,
                  dmEntityType: DMENTITYTYPE_DOCUMENT,
                  name: this.dmEntitySecuritiesForm.get('formGroupSecurities').get(control).get('name').value,
                  source: this.dmEntitySecuritiesForm.get('formGroupSecurities').get(control).get('source').value,
                  fullName: '',
                  type: this.dmEntitySecuritiesForm.get('formGroupSecurities').get(control).get('type').value,
                  read: this.dmEntitySecuritiesForm.get('formGroupSecurities').get(control).get('read').value,
                  write: this.dmEntitySecuritiesForm.get('formGroupSecurities').get(control).get('write').value,
                  fullAccess: this.dmEntitySecuritiesForm.get('formGroupSecurities').get(control).get('fullAccess').value
              }
          ),
          recursive: false
      };
      this.securityService.updateDMEntitySecurities(updateSecurityCommand)
          .pipe(
              map(res => this.loadData())
          )
          .subscribe(
              null,
              null,
              () => this.showSpinner = false
          );
  }

    add(): void {
        // open dialog to select users and groups
        // 2 panels :
        //   - left: selected elements (identified with icon user or group)
        //   - right: search panel
        //     - 2 tabs : 1) users 2) groups
        //     - autocomplete
        //     - double click => select element
        //     - when selected icon 'delete' allows to unselect user or group
        //     - filter by datasource: datasource1, 2, …, n, 'All datasources'
        //     - sort by name, firstname, id, etc
        //     - drag and drop from right to left
        //     - on submit: check if selected user belongs to selected groups and propose to not create security for user if so
        //

        this.openAddDialog();
    }

    private openAddDialog(): void {
        const dialogRef = this.dialog.open(UsersAndGroupsSelectionDialogComponent, {
            data: { selectedUsersAndGroups: new Array<UserOrGroup>() }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result !== true) {
                return;
            }

            const newSecurities = dialogRef.componentInstance.data.selectedUsersAndGroups.map(userOrGroup =>
                <DMEntitySecurity> {
                    dmEntityUid: this.documentId,
                    dmEntityType: DMENTITYTYPE_DOCUMENT,
                    name: userOrGroup.element['uid'] ? userOrGroup.element['uid'] : userOrGroup.element['gid'],
                    source: userOrGroup.element.source,
                    fullName: userOrGroup.element.name,
                    type: userOrGroup.type === 'user' ? SECURITY_ENTITY_TYPE.USER : SECURITY_ENTITY_TYPE.GROUP,
                    read: false,
                    write: false,
                    fullAccess: false
                });

            this.loadData().subscribe(
                res => {
                    this.showSpinner = true;
                    this.dataSource.data = this.dataSource.data.slice().concat(newSecurities);
                    this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(this.dataSource.data));
                    this.showSpinner = false;
                }
            );

        });
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
      noSortHeader: true,
      cellHeaderIcon: 'add_circle'
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
    position: 4,
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
    position: 5,
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
    position: 6,
    matHeaderCellDef: 'fullAccess',
    sticky: false,
    displayName: 'full',
    cell: null,
    element: 'checkbox',
    class: 'mat-column-width100'
  }
];
