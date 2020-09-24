import {Component, DoCheck, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DMEntitySecurity, SecurityService, TaskInfo, UpdateSecurityCommand} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {EntityCreationService} from 'app/services/entity-creation.service';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {filter, map} from 'rxjs/operators';
import {DMENTITYTYPE_DOCUMENT} from 'app/main/utils/constants';

@Component({
  selector: 'file-permissions',
  templateUrl: './file-permissions.component.html',
  styleUrls: ['./file-permissions.component.scss']
})
export class FilePermissionsComponent implements OnInit, DoCheck {

  @Input()
  documentId: number;

  permissions: Array<DMEntitySecurity>;
  entityName: string;

  dmEntitySecuritiesForm: FormGroup;
  formArray$: Observable<AbstractControl[]>;
  showSpinner = true;
  updateSecuritiesScreen = true;

  @ViewChild('wrapper') wrapperElement: ElementRef;
  @ViewChild('overlay') overlayElement: ElementRef;

  constructor(
      private securityService: SecurityService,
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      private entityCreationService: EntityCreationService,
      private workspaceSessionService: WorkspaceSessionService,
      private fb: FormBuilder
  ) {
    this.permissions = new Array<DMEntitySecurity>();
    this.entityName = '';

    this.dmEntitySecuritiesForm = this.fb.group({
      formGroupSecurities: this.fb.group({})
    });
    this.formArray$ = new Observable<AbstractControl[]>();
  }

  ngOnInit(): void {
    this.loadData().subscribe(
        securities => {
          this.permissions = securities;
          if (securities && securities.length > 0) {
            this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(securities));
          }
          this.showSpinner = false;
        }
    );

    this.browseEntityService.getEntity(this.documentId).subscribe(
        entity => this.entityName = entity.name
    );

    this.workspaceSessionService.closeUserPermissionAdd.pipe(
        filter(next => next),
    ).subscribe(
        next => this.updateSecuritiesScreen = true
    );

    this.workspaceSessionService.newPermissionsToBeAdded.subscribe(securities => {
      this.permissions = this.permissions.concat(securities);
      this.dmEntitySecuritiesForm.setControl('formGroupSecurities', this.createFormGroup(this.permissions));
      console.dir(this.dmEntitySecuritiesForm.get('formGroupSecurities'));
    });
  }

  private loadData(): Observable<Array<DMEntitySecurity>> {
    return this.securityService.getDMEntitySecurities(
        this.sessionService.sessionToken,
        this.documentId
    );
  }

  ngDoCheck(): void {
    if (this.overlayElement !== undefined && this.overlayElement != null) {
      this.centerSpinnerElement();
    }
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

  cancel($event: MouseEvent): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.workspaceSessionService.closePermissionsDialog.next(true);
  }

  deleteRow(rowIndex: number, event): void {
    let newIndex = 0;
    const newFormGroup = this.fb.group({});
    this.permissions.slice().forEach((security, index) => {
      if (index === rowIndex) {
        this.permissions.splice(rowIndex, 1);
        const newData = this.permissions.slice();
        this.permissions = newData;
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

  updateSecurities(updateSecurityCommand: UpdateSecurityCommand): Observable<TaskInfo> {
    return this.securityService.updateDMEntitySecurities(updateSecurityCommand);
  }

  updateSecuritiesFromForm(docId?: number): Observable<TaskInfo> {
    return this.updateSecurities(this.createUpdateSecurityCommandFormForm(docId));
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

  centerSpinnerElement(): void {
    const wrapperWidth = this.wrapperElement.nativeElement.offsetWidth;
    const wrapperHeight = this.wrapperElement.nativeElement.offsetHeight;

    const overlayWidth = this.overlayElement.nativeElement.offsetWidth;
    const overlayHeight = this.overlayElement.nativeElement.offsetHeight;

    this.overlayElement.nativeElement.style.top = (wrapperWidth - overlayWidth) / 2 + 'px';
    this.overlayElement.nativeElement.style.left = (wrapperHeight - overlayHeight) / 2 + 'px';
  }

  showAddUserScreen(): void {
    this.updateSecuritiesScreen = false;
  }
}
