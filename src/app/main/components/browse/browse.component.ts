import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';
import {BehaviorSubject, combineLatest, from, of} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {ActivatedRoute, Router} from '@angular/router';
import {concatMap, mergeMap, filter, flatMap, map, skip, switchMap, takeWhile, tap} from 'rxjs/operators';

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
  loadedEntities$: BehaviorSubject<Array<DynamicFlatNodeWithUid>>;
  nodeUidsToExpand$: BehaviorSubject<Array<DMEntity>>;
  nodeUidsToExpand: Array<number>;
  initDataDone$: BehaviorSubject<boolean>;
  entitiesLoaded: Map<number, DMEntity>;

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

    this.loadedEntities$ = new BehaviorSubject<Array<DynamicFlatNodeWithUid>>([]);
    this.nodeUidsToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.initDataDone$ = new BehaviorSubject(false);
    this.nodeUidsToExpand = new Array<number>();
    this.entitiesLoaded = new Map<number, DMEntity>();
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
                  this.entitiesLoaded.set(entity.uid, entity);
                  return newNode;
              }
          ),
          flatMap(
              node => {
                  if (node['id'] !== null
                      && node['id'] !== undefined) {
                      return combineLatest(of(node), this.browseEntityService.findContainerEntitiesAtPath(Number(node['id'])));
                  } else {
                      return combineLatest(of(node), of([]));
                  }
              }, 5
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
                  res2.forEach(entityChild => this.entitiesLoaded.set(entityChild.uid, entityChild));
                  treeNode.data.isLoading = false;
                  this.tree.treeModel.update();
                  return treeNode;
              }
          )
      ).subscribe(
          res => console.log(res),
          error => console.log('error : ' + error),
          () => {
              console.log(this.nodes);
              this.initDataDone$.next(true);
          }
      );

      this.initDataDone$.pipe(
          filter(res => res === true),
          concatMap(
              res => this.route.paramMap
          ),
          switchMap(
              params => {
              const entityId = Number(params.get('entityId'));
              // this.dataSource.setInitialDataWithOpenFolder(this.entityId != null && this.entityId !== undefined ? this.entityId : null, this.matTree);
              this.entityId = entityId;
              return of(entityId);
          }),
          filter(res => res !== 0),
          concatMap(
              eId => this.browseEntityService.findAllParents(eId)
          ),
          map(res => res.reverse()),
          tap(res => this.nodeUidsToExpand = res.map(entity => entity.uid)),
          tap(res => console.log('entities =>>>>>>>>>>>')),
          tap(res => console.log(res)),
          flatMap(entities => entities),
          map((entityRet, index) => {
              console.log('entityRet');
              console.log(entityRet);
              if (index === 0) {
                  this.tree.treeModel.getNodeById(entityRet.uid).expand();
              }
              return entityRet;
          }),
          skip(1),
          concatMap(
              (entityRet, index) => combineLatest(of(entityRet.uid), this.browseEntityService.findContainerEntitiesAtPath(entityRet.uid), of(index))
          ),
          tap(
              ([parentUid, entities]) => this.tree.treeModel.getNodeById(parentUid).data.children = entities.map(entityChild => {
                  return {
                      name: entityChild.name,
                      id: entityChild.uid.toString(),
                      children: null,
                      isLoading: false
                  };
              })
          ),
          tap(
              ([parentUid, entities]) => this.tree.treeModel.update()
          ),
          tap(
              ([parentUid, entities]) => entities.forEach(ent => this.entitiesLoaded.set(ent.uid, ent))
          ),
          map(
              ([parentUid, entities, index]) => {
                  console.log(this.nodeUidsToExpand.length + ' ' + index);
                  this.tree.treeModel.getNodeById(parentUid).expand();
                  return index;
              }
          ),
          takeWhile(
              index => (index < (this.nodeUidsToExpand.length - 2))
          )
      ).subscribe(
          res => this.initDataDone$.complete(),
          null,
          () => console.log('will I complete ? Yes !')
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
      this.browseEntityService.selectedEntity$.next(
          this.entitiesLoaded.get(Number(uid))
      );
  }

    onToggleExpanded(event): void {
        from(this.tree.treeModel.getNodeById(event.node.id).data.children.filter(child =>
            child.children === null
        )).pipe(
            tap(
                child => {
                    if (child['id'] !== null) {
                        this.tree.treeModel.getNodeById(child['id']).data.isLoading = true;
                    }
                }
            ),
            mergeMap(
                child => combineLatest(of(child['id']), this.browseEntityService.findContainerEntitiesAtPath(child['id']))
            ),
            tap(
                ([parentUid, entities]) => this.tree.treeModel.getNodeById(parentUid).data.children = entities.length === 0 ?
                    [] :
                    entities.map(entityChild => {
                    return {
                        name: entityChild.name,
                        id: entityChild.uid.toString(),
                        children: null,
                        isLoading: false
                    };
                })
            ),
            tap(
                ([parentUid, entities]) => this.tree.treeModel.update()
            ),
            tap(
                ([parentUid, entities]) => entities.forEach(ent => this.entitiesLoaded.set(ent.uid, ent))
            )
        ).subscribe(
            ([parentUid, entities]) => this.tree.treeModel.getNodeById(parentUid).data.isLoading = false,
            null,
            () => console.log('children loading finished')
        );
    }
}
