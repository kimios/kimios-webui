import {Component, Input, OnInit} from '@angular/core';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {CacheSecurityService} from 'app/services/cache-security.service';
import {LockPossibility} from 'app/main/model/lock-possibility';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'entity-list-lock-button',
  templateUrl: './entity-list-lock-button.component.html',
  styleUrls: ['./entity-list-lock-button.component.scss']
})
export class EntityListLockButtonComponent implements OnInit {

  @Input()
  doc: KimiosDocument;
  lockPossibility: LockPossibility;
  iconName: string;
  disableButton: boolean;
  lockMessage: string;

  constructor(
      private cacheSecurityService: CacheSecurityService
  ) { }

  ngOnInit(): void {
    this.cacheSecurityService.getLockPossibility(this.doc).pipe(
        tap(lockPossibility => this.lockPossibility = lockPossibility),
        tap(lockPossibility => this.computeLockMessage(lockPossibility, this.doc))
    ).subscribe();
  }

  computeLockMessage(lockPossibility: LockPossibility, doc: KimiosDocument): void {
    switch (lockPossibility) {
      case LockPossibility.CAN_UNLOCK: {
        this.lockMessage = 'Unlock document';
        this.disableButton = false;
        this.iconName = 'lock_close';
        break;
      }
      case LockPossibility.CANNOT_UNLOCK: {
        this.lockMessage = 'Locked document by '
            + doc.checkoutUser
            + '@'
            + doc.checkoutUserSource;
        this.disableButton = true;
        this.iconName = 'lock_close';
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
}
