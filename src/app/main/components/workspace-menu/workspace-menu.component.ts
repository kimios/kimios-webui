import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {ContainerEntityCreationDialogComponent} from '../container-entity-creation-dialog/container-entity-creation-dialog.component';

@Component({
  selector: 'app-workspace-menu',
  templateUrl: './workspace-menu.component.html',
  styleUrls: ['./workspace-menu.component.scss']
})
export class WorkspaceMenuComponent implements OnInit {

  constructor(
      public createContainerEntityDialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  createWorkspaceDialog(): void {
    this.openDialog('workspace');
  }

  private openDialog(entityType: 'workspace' | 'folder'): void {
    const dialogRef = this.createContainerEntityDialog.open(ContainerEntityCreationDialogComponent, {
      width: '60%',
      height: '75%',
      data: {
        entityType: entityType
      }
    });
  }
}
