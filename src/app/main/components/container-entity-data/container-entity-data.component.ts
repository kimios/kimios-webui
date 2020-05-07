import {Component, Input, OnInit} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';

@Component({
  selector: 'container-entity-data',
  templateUrl: './container-entity-data.component.html',
  styleUrls: ['./container-entity-data.component.scss']
})
export class ContainerEntityDataComponent implements OnInit {
  @Input()
  entity: DMEntity;
  @Input()
  entityType: string;

  constructor() { }

  ngOnInit(): void {
  }

}
