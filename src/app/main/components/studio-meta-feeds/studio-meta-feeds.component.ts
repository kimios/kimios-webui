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
  selectedMetaFeed$: BehaviorSubject<number>;
  newMetaFeed$: BehaviorSubject<boolean>;

  constructor(
      private adminService: AdminService,
      private studioService: StudioService,
      private sessionService: SessionService
  ) {
    this.metaFeeds$ = new BehaviorSubject<Array<MetaFeed>>(null);
    this.selectedMetaFeed$ = this.adminService.selectedMetaFeed$;
    this.newMetaFeed$ = this.adminService.newMetaFeed$;
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
    this.adminService.selectedMetaFeed$.next(0);
    this.adminService.newMetaFeed$.next(true);
  }

  selectMetaFeed(metaFeed: MetaFeed): void {
    this.adminService.selectedMetaFeed$.next(metaFeed.uid);
    this.adminService.newMetaFeed$.next(false);
  }

  removeMetaFeed(uid: number): void {
    this.studioService.deleteMetaFeed(this.sessionService.sessionToken, uid).pipe(
        tap(() => this.adminService.needRefreshMetaFeeds$.next(true))
    ).subscribe();
  }

  ngAfterViewChecked(): void {
    const previousSiblingHeight = this.divider.nativeElement.previousSibling.clientHeight;
    const nextSiblingHeight = this.divider.nativeElement.nextSibling.clientHeight ?
      this.divider.nativeElement.nextSibling.clientHeight :
      0;
    const dividerHeight = Math.max(previousSiblingHeight, nextSiblingHeight);
    this.divider.nativeElement.style.height = dividerHeight + 'px';
  }
}
