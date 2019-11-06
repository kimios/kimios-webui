import {Component, Input, OnInit} from '@angular/core';
import {DMEntity} from '../../../kimios-client-api';

@Component({
  selector: 'entity-grid-tile',
  templateUrl: './entity-grid-tile.component.html',
  styleUrls: ['./entity-grid-tile.component.scss']
})
export class EntityGridTileComponent implements OnInit {

  @Input()
  entity: DMEntity;

  constructor() { }

  ngOnInit(): void {
  }

}
