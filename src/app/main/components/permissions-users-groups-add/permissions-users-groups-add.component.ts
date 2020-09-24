import {Component, Input, OnInit} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {concatMap, map, startWith} from 'rxjs/operators';
import {DMEntitySecurity} from 'app/kimios-client-api';
import {CacheSecurityService} from 'app/services/cache-security.service';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {DMENTITYTYPE_DOCUMENT, SECURITY_ENTITY_TYPE} from 'app/main/utils/constants';
import {BrowseEntityService} from 'app/services/browse-entity.service';

@Component({
  selector: 'permissions-users-groups-add',
  templateUrl: './permissions-users-groups-add.component.html',
  styleUrls: ['./permissions-users-groups-add.component.scss']
})
export class PermissionsUsersGroupsAddComponent implements OnInit {

  @Input()
  documentId: number;
  @Input()
  existingSecurities: Array<DMEntitySecurity>;

  filteredUsersAndGroups$: Observable<Array<UserOrGroup>>;
  addUserForm: FormGroup;
  formArray$: Observable<AbstractControl[]>;
  permissions: Array<DMEntitySecurity>;

  constructor(
      private cacheSecurityService: CacheSecurityService,
      private fb: FormBuilder,
      private workspaceSessionService: WorkspaceSessionService,
      private browseEntityService: BrowseEntityService
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
            concatMap(searchTerm => this.cacheSecurityService.retrieveUsersAndGroups(searchTerm)),
            map(usersAndGroups => this.filterExistingSecurities(usersAndGroups, this.existingSecurities)),
            concatMap(usersAndGroups => combineLatest(of(usersAndGroups), this.browseEntityService.getEntity(this.documentId))),
            map(([uAndG, entity]) => uAndG.filter( userOrGroup =>
                ! (userOrGroup.type === 'user'
                    && userOrGroup.element['uid'] === entity.owner
                    && userOrGroup.element.source === entity.ownerSource
                )
            )),
            map(usersAndGroups => this.filteredUsersAndGroups$ = of(
                this.filterExistingSecurities(usersAndGroups, this.permissions)
            ))
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
    // this.workspaceSessionService.
  }

  private filterExistingSecurities(usersAndGroups: Array<UserOrGroup>, excludedUsersAndGroups: Array<DMEntitySecurity>): Array<UserOrGroup> {
    return usersAndGroups.filter(
        userOrGroup => !this.userOrGroupIsInArray(userOrGroup, excludedUsersAndGroups)
    );
  }

  private userOrGroupIsInArray(userOrGroup: UserOrGroup, excludedUsersAndGroups: Array<DMEntitySecurity>): boolean {
    return excludedUsersAndGroups.filter(sec =>
        (
            (userOrGroup.type === 'user' && sec.type === SECURITY_ENTITY_TYPE.USER
                && userOrGroup.element['uid'] === sec.name)
            || (userOrGroup.type === 'group' && sec.type === SECURITY_ENTITY_TYPE.GROUP
                && userOrGroup.element['gid'] === sec.name)
        )
        && (userOrGroup.element.source === sec.source)
    ).length > 0;
  }
}
