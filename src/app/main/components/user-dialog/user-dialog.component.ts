import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {User as KimiosUser} from 'app/kimios-client-api';

export interface UserDialogData {
  user: KimiosUser;
  source: string;
  edit?: boolean;
}

@Component({
  selector: 'user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<UserDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {

  }

  ngOnInit(): void {
  }

}
