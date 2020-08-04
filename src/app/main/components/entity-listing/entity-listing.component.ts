import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {concatMap, filter, tap} from 'rxjs/operators';
import {BrowseEntityService} from 'app/services/browse-entity.service';

export enum ListingType {
  GRID = 1,
  LIST = 2
}

@Component({
  selector: 'entity-listing',
  templateUrl: './entity-listing.component.html',
  styleUrls: ['./entity-listing.component.scss']
})
export class EntityListingComponent implements OnInit {

  entities$: BehaviorSubject<Array<DMEntity>>;
  @Input()
  gridOrList: ListingType;
  private default = ListingType.GRID;
  isGrid: BehaviorSubject<boolean>;

  @Input()
  entityContainer$: BehaviorSubject<DMEntity>;

  constructor(
      private browseEntityService: BrowseEntityService,
      private cd: ChangeDetectorRef
  ) {
    this.entities$ = new BehaviorSubject<Array<DMEntity>>([]);
    if (this.gridOrList === null
        || this.gridOrList === undefined) {
      this.gridOrList = this.default;
    }
    this.isGrid = new BehaviorSubject(this.gridOrList === ListingType.GRID);
  }

  ngOnInit(): void {
    this.isGrid.next(this.gridOrList === ListingType.GRID);

    this.browseEntityService.entitiesToDisplay$
        .subscribe(
            res => {
              this.entities$.next(res);
              this.cd.markForCheck();
            }
        );
  }
}
