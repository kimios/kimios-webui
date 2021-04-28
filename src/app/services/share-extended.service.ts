import { Injectable } from '@angular/core';
import {AdministrationService, ShareService} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {ShareUtils, ShareWithTargetUser} from 'app/main/model/share-with-target-user';
import {combineLatest, Observable, of} from 'rxjs';
import {concatMap, flatMap, map, toArray} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShareExtendedService {

  constructor(
      private shareService: ShareService,
      private administrationService: AdministrationService,
      private sessionService: SessionService
  ) { }

  retrieveSharesByMeWithTargetUser(): Observable<Array<ShareWithTargetUser>> {
    return this.shareService.listEntitiesSharedByMe(this.sessionService.sessionToken).pipe(
        flatMap(shares => shares),
        concatMap(share =>
            combineLatest(
                of(share),
                this.administrationService.getManageableUser(this.sessionService.sessionToken, share.targetUserId, share.targetUserSource)
            )
        ),
        map(([share, user]) => ShareUtils.makeShareWithTargetUser(share, user)),
        toArray()
    );
  }

  retrieveSharesWithMeWithTargetUser(): Observable<Array<ShareWithTargetUser>> {
    return this.shareService.listEntitiesSharedWithMe(this.sessionService.sessionToken).pipe(
        flatMap(shares => shares),
        concatMap(share =>
            combineLatest(
                of(share),
                this.administrationService.getManageableUser(this.sessionService.sessionToken, share.targetUserId, share.targetUserSource)
            )
        ),
        map(([share, user]) => ShareUtils.makeShareWithTargetUser(share, user)),
        toArray()
    );
  }
}
