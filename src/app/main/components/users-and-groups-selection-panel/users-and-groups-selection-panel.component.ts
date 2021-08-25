import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {BehaviorSubject} from 'rxjs';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {filter, tap} from 'rxjs/operators';
import {AdminService} from 'app/services/admin.service';

@Component({
  selector: 'users-and-groups-selection-panel',
  templateUrl: './users-and-groups-selection-panel.component.html',
  styleUrls: ['./users-and-groups-selection-panel.component.scss']
})
export class UsersAndGroupsSelectionPanelComponent implements OnInit {

  @Input()
  selectedUsersAndGroups: Array<UserOrGroup>;
  selectedUsersAndGroups$: BehaviorSubject<Array<UserOrGroup>>;
  groupListId = 'groupList';
  userListId = 'userList';

  constructor(
      private adminService: AdminService
  ) {
    this.selectedUsersAndGroups$ = new BehaviorSubject<Array<UserOrGroup>>([]);
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
  }
}
