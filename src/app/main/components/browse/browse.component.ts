import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';
import {BehaviorSubject, combineLatest, of} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {ActivatedRoute, Router} from '@angular/router';
import {concatMap, flatMap, map} from 'rxjs/operators';

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
            id: 'root1',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ],
            isLoading: true
        },
        {
            id: 'root2',
            name: 'root2',
            isLoading: false,
            children: [
                { name: 'child2.1', id: 'child2.1', children: [] },
                { name: 'child2.2', id: 'child2.2', children: [
                        {name: 'grandchild2.2.1'}
                    ] }
            ]
        },
        {
            name: 'root3',
            id: 'root3',
            isLoading: true
        },
        { name: 'root4', id: 'root4', children: [] },
        { name: 'root5', id: 'root5', children: null }
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
      // load initial nodes
      this.browseEntityService.findContainerEntitiesAtPath().pipe(
          flatMap(
              res => res
          ),
          map(
              entity => {
                  const newNode = {
                      name: entity.name,
                      id: entity.uid.toString(),
                      children: null,
                      isLoading: true
                  };
                  this.nodes.push(newNode);
                  this.tree.treeModel.update();
                  return newNode;
              }
          ),
          concatMap(
              node => {
                  if (node['id'] !== null
                      && node['id'] !== undefined) {
                      return combineLatest(of(node), this.browseEntityService.findContainerEntitiesAtPath(Number(node['id'])));
                  } else {
                      return combineLatest(of(node), of([]));
                  }
              }
          ),
          map(
              ([nodeRet, res2]) => {
                  // this.nodes.push(
                  const treeNode = this.tree.treeModel.getNodeById(nodeRet.id);
                  treeNode.data.children = res2.map(entityChild => {
                      return {
                          name: entityChild.name,
                          id: entityChild.uid.toString(),
                          children: null,
                          isLoading: false
                      };
                  });
                  treeNode.data.isLoading = false;
                  this.tree.treeModel.update();
                  return treeNode;
              }
          )
      ).subscribe(
          res => console.log(res),
          error => console.log('error : ' + error),
          () => console.log(this.nodes)
      );

      // this.nodes[1]['isLoading'] = true;
      // this.tree.treeModel.getNodeById('root2')['isLoading'] = true;


      /*const self = this;
      setTimeout(() => {
          self.nodes[0]['isLoading'] = false;
          self.nodes[2]['isLoading'] = false;
          this.tree.treeModel.getNodeById('child2.2').data.name = 'uh !';
      }, 5000);*/

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
          ),
          concatMap(
              res => from(toExpand.reverse()).pipe(
          )
      ).subscribe(
          res => this.nodeUidsToExpand$.next(res)
      );*/

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
