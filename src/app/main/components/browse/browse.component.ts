import {Component, OnInit} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';
import {DynamicDataSourceDMEntity} from './dynamic-data-source-dmentity';

interface EntityNode {
  uid: number;
  label: string;
  children?: EntityNode[];
}

@Component({
  selector: 'browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  providers: [DynamicDatabase]
})
export class BrowseComponent implements OnInit {

  /*treeControl = new NestedTreeControl<EntityNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<EntityNode>();
*/

  treeControl: FlatTreeControl<DynamicFlatNodeWithUid>;

  dataSource: DynamicDataSourceDMEntity;

  constructor(
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      database: DynamicDatabase
  ) {
    this.treeControl = new FlatTreeControl<DynamicFlatNodeWithUid>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSourceDMEntity(this.treeControl, database, browseEntityService);

    this.dataSource.setInitialData();
  }

  getLevel = (node: DynamicFlatNodeWithUid) => node.level;

  isExpandable = (node: DynamicFlatNodeWithUid) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNodeWithUid) => _nodeData.expandable;

  ngOnInit(): void {
  }

}
