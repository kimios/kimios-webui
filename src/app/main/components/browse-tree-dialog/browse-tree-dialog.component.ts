import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';

@Component({
  selector: 'app-browse-tree-dialog',
  templateUrl: './browse-tree-dialog.component.html',
  styleUrls: ['./browse-tree-dialog.component.scss']
})
export class BrowseTreeDialogComponent implements OnInit {

  browseTreeMode: BROWSE_TREE_MODE;

  constructor(
      public dialogRef: MatDialogRef<BrowseTreeDialogComponent>
  ) {
    this.browseTreeMode = BROWSE_TREE_MODE.SEARCH_FORM_DIALOG;
  }

  ngOnInit(): void {
  }

}
