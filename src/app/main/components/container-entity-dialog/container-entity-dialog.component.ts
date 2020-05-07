import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DetailDialogData} from 'app/main/components/file-detail-dialog/file-detail-dialog.component';

@Component({
  selector: 'container-entity-dialog',
  templateUrl: './container-entity-dialog.component.html',
  styleUrls: ['./container-entity-dialog.component.scss']
})
export class ContainerEntityDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<ContainerEntityDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DetailDialogData
  ) { }

  ngOnInit(): void {
  }

}
