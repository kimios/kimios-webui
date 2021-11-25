import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {DMEntitySecurity, SecurityService, TaskInfo, UpdateSecurityCommand} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {ColumnDescriptionWithElement} from 'app/main/model/column-description-with-element';
import {MatDialog, MatTableDataSource, Sort} from '@angular/material';
import {concatMap, filter, map, tap} from 'rxjs/operators';
import {UsersAndGroupsSelectionDialogComponent} from 'app/main/components/users-and-groups-selection-dialog/users-and-groups-selection-dialog.component';
import {EntityCreationService} from 'app/services/entity-creation.service';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {AdminService} from 'app/services/admin.service';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {DMEntitySort} from '../../model/dmentity-sort';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {el} from '@angular/platform-browser/testing/src/browser_util';

export interface DialogData {
    selectedUsersAndGroups: Array<UserOrGroup>;
    currentSecurities: Array<DMEntitySecurity>;
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
  documentId$: BehaviorSubject<number>;

    @Input()
    showFormButtons = true;

    @Input()
    showButtonForSearchUsersAndGroups = true;

  dmEntitySecuritiesForm: FormGroup;
  formArray$: Observable<AbstractControl[]>;

  dataSource: MatTableDataSource<DMEntitySecurity>;
  columnsDescription: ColumnDescriptionWithElement[] = DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [];
  @Input()
  showSpinner = true;
  sort = <DMEntitySort> {
    name: 'name',
    direction: 'asc'
  };

  constructor(
      private fb: FormBuilder,
      private securityService: SecurityService,
      private sessionService: SessionService,
      public dialog: MatDialog,
      private entityCreationService: EntityCreationService,
      private adminService: AdminService,
      private documentDetailService: DocumentDetailService
  ) {
    this.dmEntitySecuritiesForm = this.fb.group({
      formGroupSecurities: this.fb.group({})
    });
    this.columnsDescription.forEach((elem) => {
      this.displayedColumns.push(elem.matHeaderCellDef);
    });
    this.formArray$ = new Observable<AbstractControl[]>();
    this.documentId$ = new BehaviorSubject<number>(null);
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<DMEntitySecurity>([]);

    this.documentId$.pipe(
      filter(docId => docId != null),
      concatMap(docId => this.loadData())
    ).subscribe(
        res => {
          if (res && res.length > 0) {
            this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(res));
          }
          this.dataSource.data = res;
          this.showSpinner = false;
        }
    );

      this.entityCreationService.newUserOrGroupTmp$.pipe(
          filter(userOrGroup => userOrGroup != null && userOrGroup !== undefined),
          filter(userOrGroup => ! this.isInDatasource(this.dataSource, userOrGroup))
      ).subscribe(
          next =>  this.addNewSecurityToDatasource(next)
      );
      this.entityCreationService.removedUserOrGroupTmp$.subscribe(
          next =>  this.removeSecurityInDatasource(next)
      );

      this.entityCreationService.onFormSubmitted$.pipe(
          concatMap(next => {
              this.documentId = next;
              return this.updateSecuritiesFromForm();
          }),
          map(res => this.loadData())
      ).subscribe(
          next => this.entityCreationService.onFormSecuritiesSubmitted$.next(true),
          error => this.entityCreationService.onFormSecuritiesSubmitted$.next(false)
      );

    if (this.documentId == null) {
      this.documentDetailService.currentDocumentId$.pipe(
        filter(docId => docId != null),
        tap(docId => this.documentId = docId),
        tap(docId => this.documentId$.next(docId))
      ).subscribe();
    } else {
      this.documentId$.next(this.documentId);
    }
  }

    private addNewSecurityToDatasource(userOrGroup: UserOrGroup): void {
      this.dataSource.data = this.dataSource.data.slice().concat(
        <DMEntitySecurity> {
            dmEntityUid: this.documentId,
            dmEntityType: DMENTITYTYPE_DOCUMENT,
            name: userOrGroup.element['uid'] ? userOrGroup.element['uid'] : userOrGroup.element['gid'],
            source: userOrGroup.element.source,
            fullName: userOrGroup.element.name,
            type: userOrGroup.type === 'user' ? SECURITY_ENTITY_TYPE.USER : SECURITY_ENTITY_TYPE.GROUP,
            read: false,
            write: false,
            fullAccess: false
        });
//        this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(this.dataSource.data));
        this.updateFormGroup(this.dataSource.data, this.dmEntitySecuritiesForm.get('formGroupSecurities') as FormGroup);
    }

    private removeSecurityInDatasource(userOrGroup: UserOrGroup): void {
        const idx = this.dataSource.data.findIndex(security =>
            security.name === userOrGroup.element['uid'] ?
                userOrGroup.element['uid'] :
                userOrGroup.element['gid']
        );
        const dataTmp = this.dataSource.data.slice();
        dataTmp.splice(idx, 1);
        this.dataSource.data = dataTmp.slice();
        this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(this.dataSource.data));
    }

  private loadData(): Observable<Array<DMEntitySecurity>> {
    return this.securityService.getDMEntitySecurities(
        this.sessionService.sessionToken,
        this.documentId
    );
  }

  deleteRow(rowIndex: number, event): void {
      let newIndex = 0;
      const newFormGroup = this.fb.group({});
      this.dataSource.data.slice().forEach((security, index) => {
          if (index === rowIndex) {
              this.dataSource.data.splice(rowIndex, 1);
              const newData = this.dataSource.data.slice();
              this.dataSource.data = newData;
          } else {
              newFormGroup.addControl(
                  newIndex.toString(),
                  (this.dmEntitySecuritiesForm.get('formGroupSecurities') as FormGroup).get(index.toString())
              );
              newIndex++;
          }
      });
      this.dmEntitySecuritiesForm.setControl('formGroupSecurities', newFormGroup);
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
              security.name + '_' + security.source + '_' + security.type,
                this.createSecurityFormGroup(security)
            )
        );
        return fg;
    }

    private updateFormGroup(newSecurityRules: Array<DMEntitySecurity>, formGroup: FormGroup): number {
      let nbAdd = 0;
      newSecurityRules.forEach(security => {
          // not in form group yet => add it
          if (! this.formGroupContainsDmSecurityEntity(formGroup, security)) {
              formGroup.addControl(
                security.name + '_' + security.source + '_' + security.type,
                  this.createSecurityFormGroup(security)
              );
              nbAdd++;
          }
      });
      return nbAdd;
    }

    private formGroupContainsDmSecurityEntity(formGroup: FormGroup, security: DMEntitySecurity): boolean {
        return Object.keys(formGroup.controls).filter(controlKey => {
            const name = formGroup.get(controlKey).get('name');
            const source = formGroup.get(controlKey).get('source');
            const type = formGroup.get(controlKey).get('type');
            return name !== null
                && source !== null
                && name.value === security.name
                && source.value === security.source
                && type.value === security.type ;
        }).length > 0;
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
        this.updateSecuritiesFromForm()
          .pipe(
              map(res => this.loadData())
          )
          .subscribe(
              null,
              null,
              () => this.showSpinner = false
          );
  }

  createUpdateSecurityCommandFormForm(docId?: number): UpdateSecurityCommand {
      return <UpdateSecurityCommand> {
          sessionId: this.sessionService.sessionToken,
          dmEntityId: this.documentId,
          appendMode: true,
          securities: Object.keys((this.dmEntitySecuritiesForm.get('formGroupSecurities') as FormGroup).controls).map(control =>
              <DMEntitySecurity> {
                  dmEntityUid: docId ? docId : this.documentId,
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
  }

  updateSecurities(updateSecurityCommand: UpdateSecurityCommand): Observable<TaskInfo> {
      return this.securityService.updateDMEntitySecurities(updateSecurityCommand);
  }

  updateSecuritiesFromForm(docId?: number): Observable<TaskInfo> {
      return this.updateSecurities(this.createUpdateSecurityCommandFormForm(docId));
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
            data: {
                selectedUsersAndGroups: new Array<UserOrGroup>(),
                currentSecurities: this.dataSource.connect().getValue()
            },
            width: '800px',
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result !== true) {
                this.adminService.addUserOrGroupToPermissions$.next(null);
                this.adminService.selectedUsersAndGroups$.next(null);
                return;
            }

            const newSecurities = this.adminService.selectedUsersAndGroups$.getValue().map(userOrGroup =>
                <DMEntitySecurity> {
                    dmEntityUid: this.documentId,
                    dmEntityType: DMENTITYTYPE_DOCUMENT,
                    name: userOrGroup.element['uid'] ? userOrGroup.element['uid'] : userOrGroup.element['gid'],
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

            this.adminService.addUserOrGroupToPermissions$.next(null);
            this.adminService.selectedUsersAndGroups$.next(null);
        });
    }

    private isInDatasource(dataSource: MatTableDataSource<DMEntitySecurity>, userOrGroup: UserOrGroup): boolean {
        const idx = dataSource.data.findIndex(dmEntitySecurity =>
            ((dmEntitySecurity.type === SECURITY_ENTITY_TYPE.USER
                    && userOrGroup.type === 'user'
                    && dmEntitySecurity.name === userOrGroup.element['uid'])
                || (dmEntitySecurity.type === SECURITY_ENTITY_TYPE.GROUP
                    && userOrGroup.type === 'group'
                    && dmEntitySecurity.name === userOrGroup.element['gid']
                ))
            && dmEntitySecurity.source === userOrGroup.element.source
        );

        return idx !== -1;
    }

  sortData($event: Sort): void {
    this.sort.name = $event.active;
    this.sort.direction =
      $event.direction.toString() === 'desc' ?
        'desc' :
        'asc';
    const unsortedData = this.dataSource.connect().getValue();
    // const sortType = sortTypeMapping[this.sort.name] ? sortTypeMapping[this.sort.name] : 'string';
    const sort = this.sort;
    const sortedData = unsortedData.sort((elem1, elem2) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      const cmp = this.compareValuesInFormGroup(
        this.dmEntitySecuritiesForm.get('formGroupSecurities') as FormGroup,
        elem1.name + '_' + elem1.source + '_' + elem1.type,
        elem2.name + '_' + elem2.source + '_' + elem2.type,
        sort.name
      );
      return dir * cmp;
    });
    this.dataSource.data = sortedData;
  }

  compareValuesInFormGroup(formGroup: FormGroup, formGroupName1: string,
                           formGroupName2: string, formControlName: string): number {
    const value1 = formGroup.get(formGroupName1) ?
      formGroup.get(formGroupName1).get(formControlName) ?
        formGroup.get(formGroupName1).get(formControlName).value :
        null :
      null;
    const value2 = formGroup.get(formGroupName1) ?
      formGroup.get(formGroupName2).get(formControlName) ?
        formGroup.get(formGroupName2).get(formControlName).value :
        null :
      null;
    if (value1 === null || value2 === null) {
      return 0;
    }

    return ['type', 'name'].includes(formControlName) ?
      value1.localeCompare(value2) :
      value1 === true && value2 === false ?
        -1 :
        value1 === false && value2 === true ?
          1 :
          0;
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
    class: 'mat-column-width50'
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
    class: 'mat-column-width50'
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
    class: 'mat-column-width50'
  }
];
