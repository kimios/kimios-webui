import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {EntityMoveDialogData} from '../entity-move-dialog/entity-move-dialog.component';
import {DMEntity} from '../../../kimios-client-api';

export interface ContainerEntityCreationDialogData {
  entityType: 'workspace' | 'folder';
}

@Component({
  selector: 'container-entity-creation-dialog',
  templateUrl: './container-entity-creation-dialog.component.html',
  styleUrls: ['./container-entity-creation-dialog.component.scss']
})
export class ContainerEntityCreationDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<ContainerEntityCreationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ContainerEntityCreationDialogData,
  ) {

  }

  ngOnInit(): void {
  }

}
