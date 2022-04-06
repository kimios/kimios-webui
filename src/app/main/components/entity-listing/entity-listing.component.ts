import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';
import {ListingType} from 'app/main/model/listing-type.enum';
import {DMEntityWrapper} from '../../../kimios-client-api/model/dMEntityWrapper';

@Component({
  selector: 'entity-listing',
  templateUrl: './entity-listing.component.html',
  styleUrls: ['./entity-listing.component.scss']
})
export class EntityListingComponent implements OnInit {

  entities$: BehaviorSubject<Array<DMEntityWrapper>>;

  isGrid: BehaviorSubject<boolean>;

  @Input()
  entityContainer$: BehaviorSubject<DMEntity>;

  constructor(
      private browseEntityService: BrowseEntityService,
      private cd: ChangeDetectorRef,
      private workspaceSessionService: WorkspaceSessionService
  ) {
    this.entities$ = new BehaviorSubject<Array<DMEntityWrapper>>([]);
    this.isGrid = new BehaviorSubject(this.workspaceSessionService.gridOrList === ListingType.GRID);
  }

  ngOnInit(): void {
    this.isGrid.next(this.workspaceSessionService.gridOrList === ListingType.GRID);

    this.browseEntityService.entitiesToDisplay$
        .subscribe(
            res => {
              this.entities$.next(res);
              this.cd.markForCheck();
            }
        );
  }

  onValChange(value: any): void {
    this.workspaceSessionService.gridOrList = Number(value);
    this.isGrid.next(this.workspaceSessionService.gridOrList === ListingType.GRID);
  }
}
