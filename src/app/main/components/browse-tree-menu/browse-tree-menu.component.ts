import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {ContainerEntityCreationDialogComponent} from 'app/main/components/container-entity-creation-dialog/container-entity-creation-dialog.component';
import {filter, tap} from 'rxjs/operators';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'browse-tree-menu',
  templateUrl: './browse-tree-menu.component.html',
  styleUrls: ['./browse-tree-menu.component.scss']
})
export class BrowseTreeMenuComponent implements OnInit {

  dialogRef: MatDialogRef<ContainerEntityCreationDialogComponent>;

  constructor(
      public createContainerEntityDialog: MatDialog,
      public confirmDialog: MatDialog,
      private sessionService: SessionService
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
    this.dialogRef = this.createContainerEntityDialog.open(ContainerEntityCreationDialogComponent, {
      width: '60%',
      height: '75%',
      data: {
        entityType: entityType
      },
      disableClose: true
    });

    this.dialogRef.backdropClick().pipe(
      tap(() => { if (this.sessionService.dirtyForm$.getValue() === true) {
        this.openConfirmDialog('You have unsaved work', ['Any modification will be lost. Are you sure?']);
      } else {
        this.dialogRef.close();
      }})
    ).subscribe();
  }

  openConfirmDialog(title: string, messageLines: Array<string>): void {
    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle: title,
        messageLine1: messageLines[0]
      }
    });

    dialogRef.afterClosed().pipe(
      filter(res => res === true),
      tap(() => this.dialogRef.close())
    ).subscribe();
  }
}
