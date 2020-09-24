import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {DMEntitySecurity} from 'app/kimios-client-api';
import {CacheSecurityService} from 'app/services/cache-security.service';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {DMENTITYTYPE_DOCUMENT, SECURITY_ENTITY_TYPE} from 'app/main/utils/constants';

@Component({
  selector: 'permissions-users-groups-add',
  templateUrl: './permissions-users-groups-add.component.html',
  styleUrls: ['./permissions-users-groups-add.component.scss']
})
export class PermissionsUsersGroupsAddComponent implements OnInit {

  @Input()
  documentId: number;
  filteredUsersAndGroups$: Observable<Array<UserOrGroup>>;
  addUserForm: FormGroup;
  formArray$: Observable<AbstractControl[]>;
  permissions: Array<DMEntitySecurity>;

  constructor(
      private cacheSecurityService: CacheSecurityService,
      private fb: FormBuilder,
      private workspaceSessionService: WorkspaceSessionService
  ) {
    this.permissions = new Array<DMEntitySecurity>();
    this.addUserForm = this.fb.group({
      'securities': this.fb.group({}),
      'userOrGroupInput': this.fb.control('')
    });
  }

  ngOnInit(): void {
    this.addUserForm.get('userOrGroupInput').valueChanges
        .pipe(
            startWith(''),
            map(searchTerm => this.filteredUsersAndGroups$ = this.cacheSecurityService.retrieveUsersAndGroups(searchTerm))
        ).subscribe();
  }

  searchUsersAndGroups(value: string): void {

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

  addToList(userOrGroup: UserOrGroup): void {
    const newSec = <DMEntitySecurity> {
      dmEntityUid: this.documentId,
      dmEntityType: DMENTITYTYPE_DOCUMENT,
      name: userOrGroup.element['uid'] ? userOrGroup.element['uid'] : userOrGroup.element['gid'],
      source: userOrGroup.element.source,
      fullName: userOrGroup.element.name,
      type: userOrGroup.type === 'user' ? SECURITY_ENTITY_TYPE.USER : SECURITY_ENTITY_TYPE.GROUP,
      read: false,
      write: false,
      fullAccess: false
    };
    const fg = this.addUserForm.get('securities') as FormGroup;
    let idx = 0;
    for (const ctl in fg.controls) {
      if (fg.controls[ctl] !== null) {
        idx++;
      }
    }
    fg.addControl(idx.toString(), this.createSecurityFormGroup(newSec));
    this.permissions.push(newSec);
  }

  cancel($event: MouseEvent): void {
    this.workspaceSessionService.closeUserPermissionAdd.next(true);
  }

  submit($event: MouseEvent): void {

  }
}
