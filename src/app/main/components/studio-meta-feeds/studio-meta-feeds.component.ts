import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MetaFeed, StudioService} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {concatMap, filter, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'studio-meta-feeds',
  templateUrl: './studio-meta-feeds.component.html',
  styleUrls: ['./studio-meta-feeds.component.scss']
})
export class StudioMetaFeedsComponent implements OnInit {
  metaFeeds$: BehaviorSubject<Array<MetaFeed>>;

  constructor(
      private adminService: AdminService,
      private studioService: StudioService,
      private sessionService: SessionService
  ) {
    this.metaFeeds$ = new BehaviorSubject<Array<MetaFeed>>(null);
  }

  ngOnInit(): void {
    this.studioService.getMetaFeeds(this.sessionService.sessionToken).subscribe(
        res => this.metaFeeds$.next(res)
    );

    this.adminService.needRefreshMetaFeeds$.pipe(
        filter(val => val === true),
        concatMap(() => this.studioService.getMetaFeeds(this.sessionService.sessionToken)),
        tap(metaFeeds => this.metaFeeds$.next(metaFeeds))
    ).subscribe();
  }

  handleCreateMetaFeed(): void {

  }

  selectMetaFeed(metaFeed: MetaFeed): void {

  }
}
