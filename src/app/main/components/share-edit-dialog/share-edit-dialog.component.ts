import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ShareDialogData} from 'app/main/components/share-dialog/share-dialog.component';
import {ShareUtils, ShareWithTargetUser} from 'app/main/model/share-with-target-user';
import {SecurityService} from 'app/kimios-client-api';

@Component({
  selector: 'share-edit-dialog',
  templateUrl: './share-edit-dialog.component.html',
  styleUrls: ['./share-edit-dialog.component.scss']
})
export class ShareEditDialogComponent implements OnInit {

  shareWithTargetUser: ShareWithTargetUser;

  constructor(
      public dialogRef: MatDialogRef<ShareEditDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ShareDialogData,
      private securityService: SecurityService
  ) {

  }

  ngOnInit(): void {
    this.shareWithTargetUser = ShareUtils.makeShareWithTargetUser(this.data.share, null);
  }
}
