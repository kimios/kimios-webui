import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DialogData} from 'app/main/components/file-security/file-security.component';
import {UserOrGroup} from 'app/main/components/users-and-groups-selection-panel/users-and-groups-selection-panel.component';

@Component({
  selector: 'users-and-groups-selection-dialog',
  templateUrl: './users-and-groups-selection-dialog.component.html',
  styleUrls: ['./users-and-groups-selection-dialog.component.scss']
})
export class UsersAndGroupsSelectionDialogComponent implements OnInit {

  selectedUsersAndGroups: Array<UserOrGroup>;

  constructor(
      public dialogRef: MatDialogRef<UsersAndGroupsSelectionDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.selectedUsersAndGroups = data.selectedUsersAndGroups;
  }

  ngOnInit(): void {
  }

  submit(): void {
    this.dialogRef.close(true);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
