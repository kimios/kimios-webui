import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {BehaviorSubject} from 'rxjs';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {filter, tap} from 'rxjs/operators';
import {AdminService} from 'app/services/admin.service';
import {DMEntitySecurity} from 'app/kimios-client-api';

@Component({
  selector: 'users-and-groups-selection-panel',
  templateUrl: './users-and-groups-selection-panel.component.html',
  styleUrls: ['./users-and-groups-selection-panel.component.scss']
})
export class UsersAndGroupsSelectionPanelComponent implements OnInit {

  @Input()
  selectedUsersAndGroups: Array<UserOrGroup>;
  @Input()
  currentSecurities: Array<DMEntitySecurity>;
  selectedUsersAndGroups$: BehaviorSubject<Array<UserOrGroup>>;
  groupListId = 'groupList';
  userListId = 'userList';

  itemOver: UserOrGroup;

  constructor(
      private adminService: AdminService
  ) {
    this.selectedUsersAndGroups$ = new BehaviorSubject<Array<UserOrGroup>>([]);
    this.itemOver = null;
  }

  ngOnInit(): void {
    this.adminService.addUserOrGroupToPermissions$.pipe(
        filter(userOrGroup => userOrGroup != null),
        tap(userOrGroup => this.updateUsersAndGroups(userOrGroup))
    ).subscribe();
  }

  drop(event: CdkDragDrop<UserOrGroup>): void {
    this.updateUsersAndGroups(event.item.data);
  }

  updateUsersAndGroups(userOrGroup: UserOrGroup): void {
    const index = this.selectedUsersAndGroups.findIndex(
        obj => obj.type === userOrGroup.type
            && obj.element.name === userOrGroup.element.name
            && obj.element.source === userOrGroup.element.source
    );
    if (index !== -1) {
      return;
    }
    this.selectedUsersAndGroups.push(userOrGroup);
    this.selectedUsersAndGroups$.next(this.selectedUsersAndGroups);
    this.adminService.selectedUsersAndGroups$.next(this.selectedUsersAndGroups);
  }

  handleMouseEnter(item: UserOrGroup): void {
    this.itemOver = item;
  }

  handleMouseLeave(item: UserOrGroup): void {
    this.itemOver = null;
  }

  removeFromSelected($event: MouseEvent, item: UserOrGroup): void {
    $event.preventDefault();
    $event.stopPropagation();

    this.selectedUsersAndGroups = this.selectedUsersAndGroups.slice().filter(userOrGroup =>
        userOrGroup.type !== item.type
        || (userOrGroup.element['uid'] && item.element['uid'] && userOrGroup.element['uid'] !== item.element['uid'])
        || (userOrGroup.element['gid'] && item.element['gid'] && userOrGroup.element['gid'] !== item.element['gid'])
        || userOrGroup.element.source !== item.element.source
    );

    this.selectedUsersAndGroups$.next(this.selectedUsersAndGroups);
    this.adminService.selectedUsersAndGroups$.next(this.selectedUsersAndGroups);
  }

  mousePointerIsOverItem(item: UserOrGroup): boolean {
    return this.itemOver != null
        && this.itemOver.type === item.type
        && (
            (this.itemOver.element['uid'] && item.element['uid'] && this.itemOver.element['uid'] === item.element['uid'])
            || (this.itemOver.element['gid'] && item.element['gid'] && this.itemOver.element['gid'] === item.element['gid'])
        ) && this.itemOver.element.source === item.element.source;
    
    /*this.selectedUsersAndGroups.findIndex(userOrGroup =>
        userOrGroup.type === item.type
        && (
            (userOrGroup.element['uid'] && item.element['uid'] && userOrGroup.element['uid'] === item.element['uid'])
            || (userOrGroup.element['gid'] && item.element['gid'] && userOrGroup.element['gid'] === item.element['gid'])
        ) && userOrGroup.element.source === item.element.source
    ) !== -1;*/
  }
}
