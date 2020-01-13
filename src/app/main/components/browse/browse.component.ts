import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {BehaviorSubject, combineLatest, from, iif, Observable, of} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {ActivatedRoute} from '@angular/router';
import {concatMap, filter, flatMap, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {TreeNodesService} from 'app/services/tree-nodes.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

interface EntityNode {
  uid: number;
  label: string;
  children?: EntityNode[];
}

enum EXPLORER_MODE {
    BROWSE = 0,
    SEARCH = 1
}

@Component({
  selector: 'browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit, AfterViewInit {

  entitiesToExpand$: BehaviorSubject<Array<DMEntity>>;
  nodeUidsToExpand: Array<number>;
  initDataDone$: BehaviorSubject<boolean>;
  entitiesLoaded: Map<number, DMEntity>;

  @Input()
  entityId: number;

  @ViewChild('tree') tree;

    nodes = [];

    pageSize: number;
    pageIndex: number;
    pageSizeOptions = [5, 10, 20];

    length: number;

    explorerMode: 'browse' | 'search';

    historyHasBack = false;
    historyHasForward = false;

    constructor(
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      private route: ActivatedRoute,
      private treeNodesService: TreeNodesService
  ) {

    this.entitiesToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.initDataDone$ = new BehaviorSubject(false);
    this.nodeUidsToExpand = new Array<number>();
    this.entitiesLoaded = new Map<number, DMEntity>();
  }

  ngOnInit(): void {
      if (this.treeNodesService.treeNodes.length > 0) {
          this.nodes = this.treeNodesService.treeNodes;
      }

      this.browseEntityService.historyHasForward.subscribe(
          next => this.historyHasForward = next
      );

      this.browseEntityService.historyHasBackward.subscribe(
          next => this.historyHasBack = next
      );
  }

  ngAfterViewInit(): void {

      // load initial nodes
      if (this.treeNodesService.treeNodes.length > 0) {
          // if (this.browseEntityService.selectedEntity$.)
      } else {
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
              res => {
                  console.log(res);
                  this.treeNodesService.treeNodes = this.tree.treeModel.nodes;
              },
              error => console.log('error : ' + error),
              () => {
                  console.log(this.nodes);
                  this.initDataDone$.next(true);
              }
          );
      }

      this.browseEntityService.selectedEntity$
          .pipe(
              filter(entity => entity !== undefined),
              concatMap(
                  entity => this.browseEntityService.findAllParents(entity.uid)
              ),
              flatMap(
                  entities => entities.reverse()
              ),
              concatMap(
                  entityRet => combineLatest(
                      of(entityRet),
                      this.tree.treeModel.getNodeById(entityRet.uid).data.children === null ?
                          this.loadChildren(entityRet.uid) :
                          of(entityRet.uid)
                  )
              ),
              tap(([entity, entityUid]) => {
                  console.log(this.tree.treeModel.expandedNodes.filter(node => node.data.id === entity.uid.toString()));
                  if (! DMEntityUtils.dmEntityIsDocument(entity)
                      && this.tree.treeModel.expandedNodes.filter(node => node.data.id === entity.uid.toString()).length === 0
                  ) {
                      this.tree.treeModel.getNodeById(entityUid).expand();
                  }
              })
          )
          .subscribe(
              next => this.treeNodesService.treeNodes = this.tree.treeModel.nodes,
              null,
              () => {
                  const entitySelected = this.browseEntityService.selectedEntity$.getValue();
                  if (DMEntityUtils.dmEntityIsFolder(entitySelected) || DMEntityUtils.dmEntityIsWorkspace(entitySelected)) {
                      this.tree.treeModel.getNodeById(entitySelected.uid).focus(true);
                      this.tree.treeModel.getNodeById(entitySelected.uid).expand();
                  } else {
                      this.tree.treeModel.getNodeById(entitySelected['parentUid']).focus(true);
                  }
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
                          entity => this.browseEntityService.selectedEntityFromGridOrTree$.next(entity)
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
      this.browseEntityService.selectedEntityFromGridOrTree$.next(
          this.entitiesLoaded.get(Number(uid))
      );
//      if (this.browseEntityService.entitiesPath.get(uid) !== null
//          && this.browseEntityService.entitiesPath.get(uid) !== undefined) {
      if (this.browseEntityService.entitiesPathIds.get(uid) !== null
          && this.browseEntityService.entitiesPathIds.get(uid) !== undefined) {
      // const idx = this.browseEntityService.entitiesPathId.findIndex(elem => elem === Number(uid));
      // if (idx !== -1) {
          this.browseEntityService.currentPath.next(this.browseEntityService.entitiesPathIds.get(uid).map(elem =>
              this.browseEntityService.entities.get(elem)
          ));
      } else {
          this.browseEntityService.findAllParents(uid, true).subscribe(
              next => {
                  this.browseEntityService.currentPath.next(next.reverse());
              }
          );
      }
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

    historyBack(): void {
        this.browseEntityService.goHistoryBack();
    }

    historyForward(): void {
        this.browseEntityService.goHistoryForward();
    }
}
