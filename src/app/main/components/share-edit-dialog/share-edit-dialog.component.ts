import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ShareDialogData} from '../share-dialog/share-dialog.component';

@Component({
  selector: 'share-edit-dialog',
  templateUrl: './share-edit-dialog.component.html',
  styleUrls: ['./share-edit-dialog.component.scss']
})
export class ShareEditDialogComponent {
  constructor(
      public dialogRef: MatDialogRef<ShareEditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ShareDialogData) {

  }
}
