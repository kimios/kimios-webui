import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DocumentVersion} from 'app/kimios-client-api';

export interface DocumentVersionDataDialogData {
  documentVersion: DocumentVersion;
}

@Component({
  selector: 'document-version-data-dialog',
  templateUrl: './document-version-data-dialog.component.html',
  styleUrls: ['./document-version-data-dialog.component.scss']
})
export class DocumentVersionDataDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DocumentVersionDataDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DocumentVersionDataDialogData) { }

  ngOnInit(): void {
  }

}
