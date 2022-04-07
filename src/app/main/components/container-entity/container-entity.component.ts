import {Component, Input, OnInit} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {filter, tap} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {DMEntityWrapper} from '../../../kimios-client-api/model/dMEntityWrapper';

@Component({
  selector: 'container-entity',
  templateUrl: './container-entity.component.html',
  styleUrls: ['./container-entity.component.scss']
})
export class ContainerEntityComponent implements OnInit {

  @Input()
  entityId: number;

  entityWrapper: DMEntityWrapper;
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

    this.entityCacheService.findContainerEntityWrapperInCache(this.entityId).pipe(
      tap(next => this.entityWrapper = next),
      tap(next =>
        this.entityType = DMEntityUtils.dmEntityIsFolder(next.dmEntity) ?
          'folder' :
          'workspace'
      )
    ).subscribe();

    this.entityCacheService.reloadedEntity$.pipe(
      filter(entity => entity != null),
      tap(entity => this.entityWrapper.dmEntity = entity)
    ).subscribe();
  }

}
