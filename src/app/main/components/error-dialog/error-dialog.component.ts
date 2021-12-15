import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

export interface ErrorDialogData {
  message: string;
  title: string;
}

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData) {
  }

  ngOnInit(): void {
    if (this.data.title == null) {
      this.data.title = '';
    }
  }

  okClick(): void {
    this.dialogRef.close();
  }
}
