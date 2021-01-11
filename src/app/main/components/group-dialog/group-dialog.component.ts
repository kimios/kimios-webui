import {Component, Inject, OnInit} from '@angular/core';
import {Group} from 'app/kimios-client-api';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

export interface GroupDialogData {
  group: Group;
  source: string;
}

@Component({
  selector: 'app-group-dialog',
  templateUrl: './group-dialog.component.html',
  styleUrls: ['./group-dialog.component.scss']
})
export class GroupDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<GroupDialogData>,
      @Inject(MAT_DIALOG_DATA) public data: GroupDialogData
  ) {

  }

  ngOnInit(): void {
  }

}
