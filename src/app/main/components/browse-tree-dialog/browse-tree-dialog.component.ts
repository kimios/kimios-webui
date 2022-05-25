import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';

export interface BrowseTreeDialogData {
  browseTreeMode: BROWSE_TREE_MODE;
  entityId: number;
}

@Component({
  selector: 'app-browse-tree-dialog',
  templateUrl: './browse-tree-dialog.component.html',
  styleUrls: ['./browse-tree-dialog.component.scss']
})
export class BrowseTreeDialogComponent implements OnInit {

  browseTreeMode: BROWSE_TREE_MODE;
  entityId: number;
  dialogTitle: string;

  constructor(
      public dialogRef: MatDialogRef<BrowseTreeDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: BrowseTreeDialogData
  ) {
    this.browseTreeMode = data && data.browseTreeMode ? data.browseTreeMode : BROWSE_TREE_MODE.SEARCH_FORM_DIALOG;
    this.entityId = data && data.entityId ? data.entityId : null;
  }

  ngOnInit(): void {
    this.dialogTitle = this.browseTreeMode === BROWSE_TREE_MODE.CHOOSE_PARENT ?
      'Choose location' :
      'Add related documents';
  }

}
