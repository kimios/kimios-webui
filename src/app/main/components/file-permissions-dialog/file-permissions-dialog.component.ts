import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DetailDialogData} from 'app/main/components/file-detail-dialog/file-detail-dialog.component';
@Component({
  selector: 'file-permissions-dialog',
  templateUrl: './file-permissions-dialog.component.html',
  styleUrls: ['./file-permissions-dialog.component.scss']
})
export class FilePermissionsDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<FilePermissionsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DetailDialogData
  ) { }

  ngOnInit(): void {
  }

}
