import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'entity-path',
  templateUrl: './entity-path.component.html',
  styleUrls: ['./entity-path.component.scss']
})
export class EntityPathComponent implements OnInit {

  @Input()
  entityPath: string;
  public entityPathSplitted: Array<string>;

  constructor() { }

  ngOnInit(): void {
    this.entityPathSplitted = this.entityPath.split('/');
  }

}
