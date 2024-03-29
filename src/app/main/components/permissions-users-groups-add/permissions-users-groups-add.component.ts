import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {concatMap, filter, map, startWith, tap} from 'rxjs/operators';
import {DMEntity, DMEntitySecurity} from 'app/kimios-client-api';
import {CacheSecurityService} from 'app/services/cache-security.service';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {DMENTITYTYPE_DOCUMENT, SECURITY_ENTITY_TYPE} from 'app/main/utils/constants';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DMEntityType, DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {MatOptionSelectionChange} from '@angular/material';
import {WindowRef} from '@agm/core/utils/browser-globals';

@Component({
  selector: 'permissions-users-groups-add',
  templateUrl: './permissions-users-groups-add.component.html',
  styleUrls: ['./permissions-users-groups-add.component.scss']
})
export class PermissionsUsersGroupsAddComponent implements OnInit, AfterViewChecked {

  @Input()
  documentId: number;
  @Input()
  existingSecurities: Array<DMEntitySecurity>;
  @Input()
  contentDivElement: ElementRef;
  @Input()
  titleDivElement: ElementRef;
  @Input()
  actionsDivElement: ElementRef;

  filteredUsersAndGroups$: Observable<Array<UserOrGroup>>;
  addUserForm: FormGroup;
  userInput: string;
  formArray$: Observable<AbstractControl[]>;
  permissions: Array<DMEntitySecurity>;

  entity: DMEntity;

  constructor(
      private cacheSecurityService: CacheSecurityService,
      private fb: FormBuilder,
      private workspaceSessionService: WorkspaceSessionService,
      private browseEntityService: BrowseEntityService,
      private cdRef: ChangeDetectorRef,
      private winRef: WindowRef
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
            filter(searchTerm => searchTerm !== undefined),
            startWith(''),
            tap(searchTerm => this.userInput = typeof searchTerm === 'string' ? searchTerm : ''),
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

    this.browseEntityService.getEntity(this.documentId).subscribe(
        next => this.entity = next
    );

    this.workspaceSessionService.submitAddUsers.pipe(
        filter(next => next)
    ).subscribe(next => {
        if (next) {
            this.submit();
        }
    });
  }

  ngAfterViewChecked(): void {
      this.cdRef.detectChanges();
      this.initContentHeight();
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
          'fullAccess': security.fullAccess,
          'fullName': security.fullName
      });
  }

  addToList(userOrGroup: UserOrGroup): void {
    const newSec = <DMEntitySecurity> {
      dmEntityUid: this.documentId,
      dmEntityType: DMENTITYTYPE_DOCUMENT,
      name: userOrGroup.element['uid'] ? userOrGroup.element['uid'] : userOrGroup.element['gid'],
      source: userOrGroup.element.source,
      fullName: userOrGroup.element['uid'] ?
          userOrGroup.element['firstName'] + ' ' + userOrGroup.element['lastName'] :
          userOrGroup.element['name'],
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
    this.sendEventResetSearch();
  }

  cancel($event: MouseEvent): void {
    this.workspaceSessionService.closeUserPermissionAdd.next(true);
  }

  submit(): void {
      const dmSecurities = Object.keys((this.addUserForm.get('securities') as FormGroup).controls).map(control =>
          <DMEntitySecurity> {
              dmEntityUid: this.documentId,
              dmEntityType: DMEntityUtils.dmEntityIsDocument(this.entity) ?
                  DMEntityType.DOCUMENT :
                  DMEntityUtils.dmEntityIsFolder(this.entity) ?
                      DMEntityType.FOLDER :
                      DMEntityType.WORKSPACE
              ,
              name: this.addUserForm.get('securities').get(control).get('name').value,
              source: this.addUserForm.get('securities').get(control).get('source').value,
              fullName: this.addUserForm.get('securities').get(control).get('fullName').value,
              type: this.addUserForm.get('securities').get(control).get('type').value,
              read: this.addUserForm.get('securities').get(control).get('read').value,
              write: this.addUserForm.get('securities').get(control).get('write').value,
              fullAccess: this.addUserForm.get('securities').get(control).get('fullAccess').value
          });
      this.workspaceSessionService.newPermissionsToBeAdded.next(dmSecurities);
      this.workspaceSessionService.closeUserPermissionAdd.next(true);
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

    sendEventResetSearch(): void {
      this.addUserForm.get('userOrGroupInput').setValue(this.userInput, {onlySelf: false, emitEvent: true});
      // this.addUserForm.get('userOrGroupInput').updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }

    onSelectionChange($event: MatOptionSelectionChange): void {
        if ($event.source.selected) {
            this.addToList($event.source.value);
        }
    }

   displayWithFunc(): string {
      return '';
   }

   initContentHeight(): void {
       const titleHeight = this.titleDivElement.nativeElement.offsetHeight;
       const titleMargins =
           Math.abs(this.winRef.getNativeWindow().getComputedStyle(this.titleDivElement.nativeElement).marginTop.replace('px', ''))
           + Math.abs(this.winRef.getNativeWindow().getComputedStyle(this.titleDivElement.nativeElement).marginBottom.replace('px', ''));
       const actionsHeight = this.actionsDivElement.nativeElement.offsetHeight;
       const actionsMargins =
           Math.abs(this.winRef.getNativeWindow().getComputedStyle(this.actionsDivElement.nativeElement).marginTop.replace('px', ''))
           + Math.abs(this.winRef.getNativeWindow().getComputedStyle(this.actionsDivElement.nativeElement).marginBottom.replace('px', ''));
       const parentParentHeight = this.contentDivElement.nativeElement.parentElement.parentElement.offsetHeight;
       const parentParentPaddings =
           Math.abs(this.winRef.getNativeWindow().getComputedStyle(this.contentDivElement.nativeElement.parentElement.parentElement)
               .paddingBottom.replace('px', ''))
           + Math.abs(this.winRef.getNativeWindow().getComputedStyle(this.contentDivElement.nativeElement.parentElement.parentElement)
               .paddingTop.replace('px', ''));

       this.contentDivElement.nativeElement.parentElement.style.height = (parentParentHeight - parentParentPaddings) + 'px';
       this.contentDivElement.nativeElement.style.height =
           parentParentHeight
           - (titleHeight + actionsHeight)
           - (actionsMargins + titleMargins)
           + 'px';
    }
}
