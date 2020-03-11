import {Component, Inject, OnInit} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

export interface EntityMoveDialogData {
  entityMoved: DMEntity;
  entityTarget: DMEntity;
}

@Component({
  selector: 'entity-move-dialog',
  templateUrl: './entity-move-dialog.component.html',
  styleUrls: ['./entity-move-dialog.component.scss']
})
export class EntityMoveDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<EntityMoveDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: EntityMoveDialogData,
  ) { }

  ngOnInit(): void {
  }

  abort(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
