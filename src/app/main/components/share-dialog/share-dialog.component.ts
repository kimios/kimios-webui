import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

export interface ShareDialogData {
  uid: number;
  name: string;
}

@Component({
  selector: 'share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss']
})
export class ShareDialogComponent {

  constructor(
      public dialogRef: MatDialogRef<ShareDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ShareDialogData) {
  }

}
