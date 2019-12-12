import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';
import {DynamicDataSourceDMEntity} from './dynamic-data-source-dmentity';
import {BehaviorSubject, from, of, zip} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {concatMap, filter, switchMap} from 'rxjs/operators';

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
export class BrowseComponent implements OnInit, AfterViewInit {

  /*treeControl = new NestedTreeControl<EntityNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<EntityNode>();
*/

  // dataSource: DynamicDataSourceDMEntity;
  selectedEntity$: BehaviorSubject<DMEntity>;
  loadedEntities$: BehaviorSubject<Array<DynamicFlatNodeWithUid>>;
  nodeUidsToExpand$: BehaviorSubject<Array<DMEntity>>;

  @Input()
  entityId: number;

  @ViewChild('tree') tree;

    nodes = [
        {
            name: 'root1',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        },
        {
            id: 'root2',
            name: 'root2',
            children: [
                { name: 'child2.1', children: [] },
                { name: 'child2.2', children: [
                        {name: 'grandchild2.2.1'}
                    ] }
            ]
        },
        { name: 'root3' },
        { name: 'root4', children: [] },
        { name: 'root5', children: null }
    ];

  constructor(
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      private route: ActivatedRoute,
      private router: Router,
      database: DynamicDatabase
  ) {
    // this.dataSource = new DynamicDataSourceDMEntity(database, browseEntityService);

    this.selectedEntity$ = new BehaviorSubject<DMEntity>(undefined);
    this.loadedEntities$ = new BehaviorSubject<Array<DynamicFlatNodeWithUid>>([]);
    this.nodeUidsToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
  }

  getLevel = (node: DynamicFlatNodeWithUid) => node.level;

  isExpandable = (node: DynamicFlatNodeWithUid) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNodeWithUid) => _nodeData.expandable;

  ngOnInit(): void {
    /*this.dataSource.setInitialData().subscribe(
        res => {
          const value = this.loadedEntities$.getValue();
          this.loadedEntities$.next(value.concat(res));
        }
    );*/


  }

  ngAfterViewInit(): void {
      // this.tree.treeModel.getNodeById('root2').expand();
      /*setTimeout(() => {
          this.nodes[0].name = 'uh';
      });*/

    /*this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          const entityId = Number(params.get('entityId'));
          // this.dataSource.setInitialDataWithOpenFolder(this.entityId != null && this.entityId !== undefined ? this.entityId : null, this.matTree);
            this.entityId = entityId;
            return of(entityId);
        }),
        filter(res => res !== null),
        concatMap(
            eId => this.browseEntityService.findAllParents(eId)
        )
    ).subscribe(
        res => this.nodeUidsToExpand$.next(res)
    );

    zip(this.loadedEntities$, this.nodeUidsToExpand$).pipe(
        concatMap(
            ([loaded, toExpand]) => {
              from(toExpand.reverse()).pipe(
                  concatMap(
                      entity => {
                        loaded.filter(node1 => toExpand.map(e => e.uid).includes(node1.uid))
                            .forEach(node1 => {
                              this.tree.treeModel.getNodeById(entity.uid.toString()).expand();
                            });
                        return of(entity);
                      }
                  )
              );
              return of();
            }
        )
    ).subscribe();*/
  }

  expandNodes(): void {}

  selectNode(uid: number): void {
    // this.selectedEntity$.next(this.dataSource.entities.get(uid));
  }
}
