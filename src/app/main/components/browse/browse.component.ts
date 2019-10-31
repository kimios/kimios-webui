import { Component, OnInit } from '@angular/core';
import {SessionService} from '../../../services/session.service';
import {BrowseEntityService} from '../../../services/browse-entity.service';
import {MatTreeNestedDataSource} from '@angular/material';
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNode} from './dynamic-flat-node';
import {DynamicDataSource} from './dynamic-data-source';

interface EntityNode {
  uid: number;
  label: string;
  children?: EntityNode[];
}

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  providers: [DynamicDatabase]
})
export class BrowseComponent implements OnInit {

  /*treeControl = new NestedTreeControl<EntityNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<EntityNode>();
*/

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  constructor(
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      database: DynamicDatabase
  ) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);

    this.dataSource.findInitialData();
  }



  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

  ngOnInit(): void {
  }

}
