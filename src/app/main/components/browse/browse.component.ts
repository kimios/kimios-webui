import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';
import {BehaviorSubject, combineLatest, from, iif, Observable, of} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {ActivatedRoute} from '@angular/router';
import {concatMap, flatMap, map, mergeMap, switchMap, tap} from 'rxjs/operators';

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

  loadedEntities$: BehaviorSubject<Array<DynamicFlatNodeWithUid>>;
  entitiesToExpand$: BehaviorSubject<Array<DMEntity>>;
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
  ) {

    this.loadedEntities$ = new BehaviorSubject<Array<DynamicFlatNodeWithUid>>([]);
    this.entitiesToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.initDataDone$ = new BehaviorSubject(false);
    this.nodeUidsToExpand = new Array<number>();
    this.entitiesLoaded = new Map<number, DMEntity>();
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

      // load initial nodes
      this.retrieveEntitiesToExpand().pipe(
          tap(res => this.entitiesToExpand$.next(res)),
          concatMap(res => this.browseEntityService.findContainerEntitiesAtPath()),
          flatMap(
              res => res
          ),
          map(
              entity => {
                  if (this.tree.treeModel.getNodeById(entity.uid) === undefined) {
                      const newNode = {
                          name: entity.name,
                          id: entity.uid.toString(),
                          children: null,
                          isLoading: true
                      };
                      this.nodes.push(newNode);
                      this.tree.treeModel.update();
                      this.entitiesLoaded.set(entity.uid, entity);
                  }
                  return entity;
              }
          ),
          flatMap(
              entityRet => {
                  if (this.entitiesToExpand$.getValue().filter(entity => entity.uid === entityRet.uid).length > 0) {
                      return combineLatest(of(entityRet), this.loadNodesChildren(this.entitiesToExpand$.getValue().map(val => val.uid)));
                  } else {
                      if (this.tree.treeModel.getNodeById(entityRet.uid).data.children === null) {
                          return combineLatest(of(entityRet), this.loadChildren(entityRet.uid));
                      }
                  }
              }, 5
          ),
      ).subscribe(
          res => console.log(res),
          error => console.log('error : ' + error),
          () => {
              console.log(this.nodes);
              this.initDataDone$.next(true);
          }
      );

 }

  retrieveEntitiesToExpand(): Observable<Array<DMEntity>> {
      return this.route.paramMap.pipe(
          switchMap(
              params => {
                  const entityId = Number(params.get('entityId'));
                  this.entityId = entityId;
                  return of(entityId);
              }),
          concatMap(
              res => res === 0 ?
                  of([]) :
                  this.browseEntityService.retrieveContainerEntity(res).pipe(
                      tap(
                          entity => this.browseEntityService.selectedEntity$.next(entity)
                      ),
                      concatMap(
                          entity => this.browseEntityService.findAllParents(entity.uid)
                      ),
                      map(entities => entities.reverse())
                  )
          )
      );
  }

  loadNodeAndChildren(entity: DMEntity): Observable<DMEntity> {
      return of(entity).pipe(
          map(
              entityRet => {
                  const newNode = {
                      name: entityRet.name,
                      id: entityRet.uid.toString(),
                      children: null,
                      isLoading: true
                  };
                  this.nodes.push(newNode);
                  this.tree.treeModel.update();
                  this.entitiesLoaded.set(entityRet.uid, entityRet);
                  return entityRet;
              }
          ),
          concatMap(
              entityRet => combineLatest(of(entityRet), this.browseEntityService.findContainerEntitiesAtPath(entityRet.uid))
          ),
          tap(
              ([entityRet, entities]) => this.tree.treeModel.getNodeById(entityRet.uid).data.children = entities.map(entityChild => {
                  return {
                      name: entityChild.name,
                      id: entityChild.uid.toString(),
                      children: null,
                      isLoading: false
                  };
              })
          ),
          tap(
              ([entityRet, entities]) => this.tree.treeModel.getNodeById(entityRet.uid.toString()).data.isLoading = false
          ),
          tap(
              ([entityRet, entities]) => this.tree.treeModel.update()
          ),
          tap(
              ([entityRet, entities]) => entities.forEach(ent => this.entitiesLoaded.set(ent.uid, ent))
          ),
          map(
              ([entityRet, entities]) => entityRet
          )
      );
  }

  loadChildren(entityUid: number): Observable<number> {
      this.tree.treeModel.getNodeById(entityUid.toString()).data.isLoading = true;
      return combineLatest(of(entityUid), this.browseEntityService.findContainerEntitiesAtPath(entityUid)).pipe(
          tap(
              ([entityUidRet, entities]) => this.tree.treeModel.getNodeById(entityUid).data.children = entities.map(entityChild => {
                  return {
                      name: entityChild.name,
                      id: entityChild.uid.toString(),
                      children: null,
                      isLoading: false
                  };
              })
          ),
          tap(
              ([entityUidRet, entities]) => this.tree.treeModel.getNodeById(entityUidRet.toString()).data.isLoading = false
          ),
          tap(
              ([entityUidRet, entities]) => this.tree.treeModel.update()
          ),
          tap(
              ([entityUidRet, entities]) => entities.forEach(ent => this.entitiesLoaded.set(ent.uid, ent))
          ),
          map(
              ([entityUidRet, entities]) => entityUidRet
          )
      );
  }



  loadNodesChildren(ids: Array<number>): Observable<number> {
      return from(ids).pipe(
//          takeWhile(uid => uid !== -1),
          concatMap(
              res => iif(
                  () => this.tree.treeModel.getNodeById(res).data.children === null,
                  this.loadChildren(res),
                  of(res)
              )
          ),
          tap(res => this.tree.treeModel.getNodeById(res).expand())
      );
  }

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
