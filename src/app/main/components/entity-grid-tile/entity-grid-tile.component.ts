import {Component, Input, OnInit} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {Observable} from 'rxjs';
import {CacheSecurityService, SecurityEnt} from 'app/services/cache-security.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';

@Component({
  selector: 'entity-grid-tile',
  templateUrl: './entity-grid-tile.component.html',
  styleUrls: ['./entity-grid-tile.component.scss']
})
export class EntityGridTileComponent implements OnInit {

  @Input()
  entity: DMEntity;
  
  iconName: string;
  securityEnt$: Observable<SecurityEnt>;

  constructor(
      private cacheSecService: CacheSecurityService,
      private browseEntityService: BrowseEntityService
  ) {
    this.securityEnt$ = new Observable<SecurityEnt>();
  }

  ngOnInit(): void {
    this.iconName = DMEntityUtils.dmEntityIsWorkspace(this.entity) || DMEntityUtils.dmEntityIsFolder(this.entity) ?
        'folder' :
        'crop_portrait';

    this.securityEnt$ = this.cacheSecService.getSecurityEnt(this.entity.uid);
  }

  handleDrop(event: Event, droppedInDir: DMEntity): void {
    event.preventDefault();
    // event.stopPropagation();

    event['droppedInDir'] = droppedInDir;
  }

  handleDragOver(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  sendDelete(entity: DMEntity): void {
    this.browseEntityService.deleteEntity(entity);
  }
}
