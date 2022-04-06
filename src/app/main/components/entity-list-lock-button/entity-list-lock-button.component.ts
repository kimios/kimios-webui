import {Component, Input, OnInit} from '@angular/core';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {CacheSecurityService} from 'app/services/cache-security.service';
import {LockPossibility} from 'app/main/model/lock-possibility';
import {concatMap, map} from 'rxjs/operators';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {combineLatest, of} from 'rxjs';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {EntityCacheService} from 'app/services/entity-cache.service';

@Component({
  selector: 'entity-list-lock-button',
  templateUrl: './entity-list-lock-button.component.html',
  styleUrls: ['./entity-list-lock-button.component.scss']
})
export class EntityListLockButtonComponent implements OnInit {

  @Input()
  docId: number;
  lockPossibility: LockPossibility;
  iconName: string;
  disableButton: boolean;
  lockMessage: string;

  constructor(
      private cacheSecurityService: CacheSecurityService,
      private documentDetailService: DocumentDetailService,
      private browseEntityService: BrowseEntityService,
      private entityCacheService: EntityCacheService
  ) { }

  ngOnInit(): void {
    this.cacheSecurityService.getLockPossibility(this.docId).pipe(
        concatMap(lockPossibility => combineLatest(of(lockPossibility), this.entityCacheService.findDocumentInCache(this.docId))),
        map(([lockPossibility, kimiosDocumentWrapper]) => {
          this.lockPossibility = lockPossibility;
          this.computeLockMessage(lockPossibility, kimiosDocumentWrapper as KimiosDocument);
        })
    ).subscribe();
  }

  computeLockMessage(lockPossibility: LockPossibility, doc: KimiosDocument): void {
    switch (lockPossibility) {
      case LockPossibility.CAN_UNLOCK: {
        this.lockMessage = 'Unlock document';
        this.disableButton = false;
        this.iconName = 'lock';
        break;
      }
      case LockPossibility.CANNOT_UNLOCK: {
        this.lockMessage = 'Locked document by '
            + doc.checkoutUser
            + '@'
            + doc.checkoutUserSource;
        this.disableButton = true;
        this.iconName = 'lock';
        break;
      }
      case LockPossibility.CAN_LOCK: {
        this.lockMessage = 'Lock document';
        this.disableButton = false;
        this.iconName = 'lock_open';
        break;
      }
      case LockPossibility.CANNOT_LOCK: {
        this.lockMessage = 'You cannot lock this document';
        this.disableButton = true;
        this.iconName = 'lock_open';
        break;
      }
    }
  }

  handleClick(): void {
    if (!this.disableButton) {
      if (this.lockPossibility === LockPossibility.CAN_LOCK) {
        this.documentDetailService.checkOut(this.docId).pipe(
          concatMap(() => this.entityCacheService.reloadEntity(this.docId))
        ).subscribe(
            next => this.ngOnInit()
        );
      } else {
        if (this.lockPossibility === LockPossibility.CAN_UNLOCK) {
          this.documentDetailService.checkIn(this.docId).pipe(
            concatMap(() => this.entityCacheService.reloadEntity(this.docId))
          ).subscribe(
              next => this.ngOnInit()
          );
        }
      }
    }
  }
}
