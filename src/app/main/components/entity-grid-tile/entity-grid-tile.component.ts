import {Component, Input, OnInit} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {BehaviorSubject} from 'rxjs';
import {CacheSecurityService, SecurityEnt} from 'app/services/cache-security.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'entity-grid-tile',
  templateUrl: './entity-grid-tile.component.html',
  styleUrls: ['./entity-grid-tile.component.scss']
})
export class EntityGridTileComponent implements OnInit {

  @Input()
  entity: DMEntity;
  
  iconName: string;
  securityEnt$: BehaviorSubject<SecurityEnt>;
  private _isDir: boolean;
  showSpinner: boolean;

  constructor(
      private cacheSecService: CacheSecurityService,
      private browseEntityService: BrowseEntityService
  ) {
    this.securityEnt$ = new BehaviorSubject<SecurityEnt>(undefined);
  }

  ngOnInit(): void {
    this.showSpinner = true;
    this.iconName = DMEntityUtils.dmEntityIsWorkspace(this.entity) || DMEntityUtils.dmEntityIsFolder(this.entity) ?
        'folder' :
        'crop_portrait';

    this.cacheSecService.getSecurityEnt(this.entity.uid).subscribe(
        next => this.securityEnt$.next(next)
    );
    this.securityEnt$.pipe(
        filter(next => next !== undefined)
    ).subscribe(
        next => this.showSpinner = false
    );
    this._isDir = DMEntityUtils.dmEntityIsFolder(this.entity);
  }

  handleDrop(event: Event, droppedInDir: DMEntity): void {
    event.preventDefault();
    if (! this.isDir) {
        event.stopPropagation();
    }
    // event.stopPropagation();

    event['droppedInDir'] = droppedInDir;
  }

  handleDragOver(event: Event): void {
    // event.stopPropagation();
    if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    }
  }

  sendDelete(entity: DMEntity): void {
    this.browseEntityService.deleteEntity(entity);
  }

    dragStart($event: DragEvent, entityUid: number): void {
      $event['kimiosEntityMove'] = true;
      $event.dataTransfer.setData('text/plain', 'kimiosEntityMove:' + entityUid);
    }

  handleDragEnter(event: Event): void {
    event.preventDefault();
  }

    get isDir(): boolean {
        return this._isDir;
    }

}
