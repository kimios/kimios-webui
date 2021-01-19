import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserDialogData} from '../user-dialog/user-dialog.component';


@Component({
  selector: 'admin-special-roles-add-to-role-dialog',
  templateUrl: './admin-special-roles-add-to-role-dialog.component.html',
  styleUrls: ['./admin-special-roles-add-to-role-dialog.component.scss']
})
export class AdminSpecialRolesAddToRoleDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<AdminSpecialRolesAddToRoleDialogComponent>
  ) { }

  ngOnInit(): void {
  }

}
