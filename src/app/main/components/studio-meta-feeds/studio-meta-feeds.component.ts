import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
export class StudioMetaFeedsComponent implements OnInit, AfterViewChecked {
  metaFeeds$: BehaviorSubject<Array<MetaFeed>>;

  @ViewChild('divider',  { read: ElementRef }) divider: ElementRef;

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
    this.adminService.newMetaFeed$.next(true);
  }

  selectMetaFeed(metaFeed: MetaFeed): void {
    console.log('selected metafeed : ' + metaFeed.uid);
    this.adminService.selectedMetaFeed$.next(metaFeed.uid);
  }

  removeMetaFeed(uid: number): void {
    this.studioService.deleteMetaFeed(this.sessionService.sessionToken, uid).pipe(
        tap(() => this.adminService.needRefreshMetaFeeds$.next(true))
    ).subscribe();
  }

  ngAfterViewChecked(): void {
    const previousSiblingHeight = this.divider.nativeElement.previousSibling.clientHeight;
    const nextSiblingHeight = this.divider.nativeElement.nextSibling.clientHeight;
    const dividerHeight = Math.max(previousSiblingHeight, nextSiblingHeight);
    this.divider.nativeElement.style.height = dividerHeight + 'px';
    console.log('set divider height to ' + dividerHeight + 'px');
  }
}
