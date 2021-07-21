import { Injectable } from '@angular/core';
import {AdministrationService, ShareService} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {ShareUtils, ShareWithTargetUser} from 'app/main/model/share-with-target-user';
import {combineLatest, Observable, of} from 'rxjs';
import {concatMap, flatMap, map, tap, toArray} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShareExtendedService {

    sharesWithMe: Array<ShareWithTargetUser>;
    sharesByMe: Array<ShareWithTargetUser>;

  constructor(
      private shareService: ShareService,
      private administrationService: AdministrationService,
      private sessionService: SessionService
  ) {
      this.sharesWithMe = undefined;
      this.sharesByMe = undefined;
  }

  retrieveSharesByMeWithTargetUser(): Observable<Array<ShareWithTargetUser>> {
    return this.sharesByMe !== undefined ?
        of(this.sharesByMe) :
        this.shareService.listEntitiesSharedByMe(this.sessionService.sessionToken).pipe(
            flatMap(shares => shares),
            /* concatMap(share =>
                combineLatest(
                    of(share),
                    this.administrationService.getManageableUser(this.sessionService.sessionToken, share.targetUserId, share.targetUserSource)
                )
            ),
            map(([share, user]) => ShareUtils.makeShareWithTargetUser(share, user)), */
            map(share => ShareUtils.makeShareWithTargetUser(share, null)),
            toArray(),
            tap(sharesWithTargetUser => this.sharesByMe = sharesWithTargetUser)
        );
  }

  retrieveSharesWithMeWithTargetUser(): Observable<Array<ShareWithTargetUser>> {
      return this.sharesWithMe !== undefined ?
          of(this.sharesWithMe) :
          this.shareService.listEntitiesSharedWithMe(this.sessionService.sessionToken).pipe(
              flatMap(shares => shares),
              /*concatMap(share =>
                  combineLatest(
                      of(share),
                      this.administrationService.getManageableUser(this.sessionService.sessionToken, share.targetUserId, share.targetUserSource)
                  )
              ),
              map(([share, user]) => ShareUtils.makeShareWithTargetUser(share, user)),*/
              map(share => ShareUtils.makeShareWithTargetUser(share, null)),
              toArray(),
              tap(sharesWithTargetUser => this.sharesWithMe = sharesWithTargetUser)
          );
  }
}
