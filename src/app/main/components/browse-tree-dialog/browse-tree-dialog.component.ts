import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';

export interface BrowseTreeDialogData {
  browseTreeMode: BROWSE_TREE_MODE;
}

@Component({
  selector: 'app-browse-tree-dialog',
  templateUrl: './browse-tree-dialog.component.html',
  styleUrls: ['./browse-tree-dialog.component.scss']
})
export class BrowseTreeDialogComponent implements OnInit {

  browseTreeMode: BROWSE_TREE_MODE;

  constructor(
      public dialogRef: MatDialogRef<BrowseTreeDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: BrowseTreeDialogData
  ) {
    this.browseTreeMode = data && data.browseTreeMode ? data.browseTreeMode : BROWSE_TREE_MODE.SEARCH_FORM_DIALOG;
  }

  ngOnInit(): void {
  }

}
