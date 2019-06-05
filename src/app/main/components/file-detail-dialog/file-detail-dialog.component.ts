import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

export interface DetailDialogData {
  uid: number;
}

@Component({
  selector: 'file-detail-dialog',
  templateUrl: './file-detail-dialog.component.html',
  styleUrls: ['./file-detail-dialog.component.scss']
})
export class FileDetailDialogComponent {

  constructor(
      public dialogRef: MatDialogRef<FileDetailDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DetailDialogData) {
  }

}
