import {Component, Input, OnInit} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {filter, tap} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {EntityCacheService} from 'app/services/entity-cache.service';

@Component({
  selector: 'container-entity',
  templateUrl: './container-entity.component.html',
  styleUrls: ['./container-entity.component.scss']
})
export class ContainerEntityComponent implements OnInit {

  @Input()
  entityId: number;

  entityData: DMEntity;
  entityType: 'folder' | 'workspace';

  constructor(
      private browseEntityService: BrowseEntityService,
      private entityCacheService: EntityCacheService
  ) { }

  ngOnInit(): void {
    if (this.entityId == null
      || this.entityId === undefined) {
      return;
    }

    this.browseEntityService.retrieveContainerEntity(this.entityId).pipe(
      tap(next => this.entityData = next),
      tap(next =>
        this.entityType = DMEntityUtils.dmEntityIsFolder(next) ?
          'folder' :
          'workspace'
      )
    ).subscribe();

    this.entityCacheService.reloadedEntity$.pipe(
      filter(entity => entity != null),
      tap(entity => this.entityData = entity)
    ).subscribe();
  }

}
