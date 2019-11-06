import {Component, Input, OnInit} from '@angular/core';
import {Group, User} from 'app/kimios-client-api';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {BehaviorSubject} from 'rxjs';

export interface UserOrGroup {
  type: string;
  element: User | Group;
}

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

  constructor() {
    this.selectedUsersAndGroups$ = new BehaviorSubject<Array<UserOrGroup>>([]);
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<UserOrGroup>): void {
    this.selectedUsersAndGroups.push(event.item.data);
    this.selectedUsersAndGroups$.next(this.selectedUsersAndGroups);
  }

}