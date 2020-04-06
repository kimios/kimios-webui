import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ContainerEntityCreationDialogComponent} from 'app/main/components/container-entity-creation-dialog/container-entity-creation-dialog.component';

@Component({
  selector: 'browse-tree-menu',
  templateUrl: './browse-tree-menu.component.html',
  styleUrls: ['./browse-tree-menu.component.scss']
})
export class BrowseTreeMenuComponent implements OnInit {

  constructor(
      public createContainerEntityDialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  createWorkspaceDialog(): void {
    this.openDialog('workspace');
  }

  createFolderDialog(): void {
    this.openDialog('folder');
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
