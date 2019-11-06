import {Component, Input, OnInit} from '@angular/core';
import {DMEntity} from '../../../kimios-client-api';
import {DMEntityUtils} from '../../utils/dmentity-utils';

@Component({
  selector: 'entity-grid-tile',
  templateUrl: './entity-grid-tile.component.html',
  styleUrls: ['./entity-grid-tile.component.scss']
})
export class EntityGridTileComponent implements OnInit {

  @Input()
  entity: DMEntity;
  
  iconName: string;

  constructor() { }

  ngOnInit(): void {
    this.iconName = DMEntityUtils.dmEntityIsWorkspace(this.entity) || DMEntityUtils.dmEntityIsFolder(this.entity) ?
        'folder' :
        'crop_portrait';
  }

}
