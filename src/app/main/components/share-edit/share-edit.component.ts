import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {Share, ShareService} from 'app/kimios-client-api';
import {ShareWithTargetUser} from 'app/main/model/share-with-target-user';

@Component({
  selector: 'share-edit',
  templateUrl: './share-edit.component.html',
  styleUrls: ['./share-edit.component.scss']
})
export class ShareEditComponent implements OnInit {

  @Input()
  share: ShareWithTargetUser;

  accessOk = true;
  shareToEdit: Share;

  constructor(
      private sessionService: SessionService,
      private shareService: ShareService
  ) {
    this.shareToEdit = null;
  }

  ngOnInit(): void {
    /*this.shareService.retrieveShare(this.sessionService.sessionToken, this.shareId).subscribe(
        share => {
          if (share == null) {
            this.accessOk = false;
            this.sessionService.closeShareEditDialog$.next(true);
          } else {
            this.accessOk = true;
            this.share = share;
          }
        }
    );*/

    if (this.share != null
        && this.share !== undefined) {
      this.shareToEdit = this.share;
      this.accessOk = true;
    }
  }

}
