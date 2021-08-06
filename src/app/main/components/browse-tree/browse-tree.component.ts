import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, from, iif, Observable, of} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {TreeNodesService} from 'app/services/tree-nodes.service';
import {concatMap, filter, flatMap, map, mergeMap, switchMap, take, tap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {ActivatedRoute} from '@angular/router';
import {EntityCreationService} from 'app/services/entity-creation.service';
import {ContainerEntityDialogComponent} from 'app/main/components/container-entity-dialog/container-entity-dialog.component';
import {MatDialog} from '@angular/material';
import {ContainerEntityCreationDialogComponent} from 'app/main/components/container-entity-creation-dialog/container-entity-creation-dialog.component';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';

@Component({
  selector: 'browse-tree',
  templateUrl: './browse-tree.component.html',
  styleUrls: ['./browse-tree.component.scss']
})
export class BrowseTreeComponent implements OnInit, AfterViewInit {

  @Input()
  entityId: number;
  @Input()
  mode: BROWSE_TREE_MODE = BROWSE_TREE_MODE.BROWSE;

  entitiesToExpand$: BehaviorSubject<Array<DMEntity>>;
  nodeUidsToExpand: Array<number>;
  initDataDone$: BehaviorSubject<boolean>;
  entitiesLoaded: Map<number, DMEntity>;

  @ViewChild('tree') tree;

  nodes = [];
  treeOptions = {
    actionMapping: {
        mouse: {
            drop: (tree, node, $event) => {
                // console.log('drop'); // from === {name: 'first'}
                // Add a node to `to.parent` at `to.index` based on the data in `from`
                // Then call tree.update()
                $event['droppedInDir'] = node && node.id ? node.id : null;
                $event['droppedInTreeNode'] = true;
            },
            dragStart: (tree, node, $event) => {
                if (node
                    && node.data
                    && node.data.id) {
                    $event.dataTransfer.setData('text/plain', 'kimiosEntityMove:' + node.data.id);
                }
            }
        }
    },
    allowDrag: true,
    allowDrop: true
  };

  constructor(
      private treeNodesService: TreeNodesService,
      private browseEntityService: BrowseEntityService,
      private route: ActivatedRoute,
      private entityCreationService: EntityCreationService,
      public containerEntityDialog: MatDialog,
      public createContainerEntityDialog: MatDialog
  ) {
    this.entitiesToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.initDataDone$ = new BehaviorSubject(false);
    this.nodeUidsToExpand = new Array<number>();
    this.entitiesLoaded = new Map<number, DMEntity>();
  }

  ngOnInit(): void {
      this.browseEntityService.browseMode$.next(this.mode);

    if (this.treeNodesService.treeNodes.length > 0) {
      this.nodes = this.treeNodesService.treeNodes;
      this.tree.treeModel.update();
    }

      this.browseEntityService.updateMoveTreeNode$.subscribe(
          next => this.updateMoveTreeNode(next.entityMoved, next.entityTarget, next.initialParentUid)
      );

    /*this.entityCreationService.onFormSubmitted$.pipe(
        concatMap( next => this.browseEntityService.retrieveContainerEntity(next))
    ).subscribe(
        next => updateTree
    )*/
  }

    ngAfterViewInit(): void {

        // load initial nodes
        if (this.treeNodesService.treeNodes.length > 0) {
            // if (this.browseEntityService.selectedEntity$.)
            this.initDataDone$.next(true);
        } else {
            this.retrieveEntitiesToExpand().pipe(
                tap(res => this.entitiesToExpand$.next(res)),
                concatMap(res => this.browseEntityService.findContainerEntitiesAtPath()),
                take(1),
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
                                isLoading: true,
                                allowDrop: true,
                                svgIcon: DMEntityUtils.dmEntityIsWorkspace(entity) ? 'workspace' : 'folder'
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
                            return combineLatest(of(entityRet),
                                this.loadNodesChildren(this.entitiesToExpand$.getValue().map(val => val.uid)).pipe(
                                toArray(),
                                tap(array => {
                                    if (array.length > 0) {
                                        this.tree.treeModel.setFocusedNode(
                                            this.tree.treeModel.getNodeById(array.reverse()[0])
                                        );
                                        this.browseEntityService.selectedFolder$.next(this.entitiesToExpand$.getValue().slice().reverse()[0]);
                                    }
                                }),
//                                tap(array => this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(nodeIdToFocus))),
                                map(array => true)
                            )).pipe(
                                map(res => true)
                            );
                        } else {
                            if (this.tree.treeModel.getNodeById(entityRet.uid).data.children === null) {
                                return combineLatest(of(entityRet), this.loadChildren(entityRet.uid)).pipe(
                                    map(res => true)
                                );
                            }
                        }
                    }, 5
                ),
            ).subscribe(
                (res) => {
                    this.treeNodesService.treeNodes = this.tree.treeModel.nodes;
                },
                error => console.log('error : ' + error),
                () => {
                    this.initDataDone$.next(true);
                }
            );
        }

    this.initDataDone$
        .pipe(
            filter(res => res === true),
            concatMap(res => this.browseEntityService.selectedEntity$),
            filter(entity => entity !== undefined),
            tap(entity => this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entity.uid))),
            concatMap(
                entity => this.browseEntityService.findAllParents(entity.uid)
            ),
            flatMap(
                entities => entities.reverse()
            ),
            tap(
                entityRet => {
                  this.tree.treeModel.update();
                  if (this.tree === null) {
                    console.log('this.tree is null');
                  } else {
                    if (this.tree.treeModel === null) {
                      console.log('this.tree.treeModele is null');
                    } else {

                      if (this.tree.treeModel.getNodeById(entityRet.uid.toString()) === null) {
                        console.log('>>>>>>>>>>>>');
                        console.log('this.tree.treeModel.getNodeById( ' + entityRet.uid + ' ) === null');
                        console.log(entityRet);
                        console.log(this.nodes);
                        console.log('<<<<<<<<<<<<<<<<<<<<<<<<');
                      }
                    }
                  }
                }
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
            next => {
              this.treeNodesService.treeNodes = this.tree.treeModel.nodes;
            },
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

    this.browseEntityService.nodeToRemoveFromTree.subscribe(
        next => {
          let parentUid: number;
          if (next['parentUid'] !== null && next['parentUid'] !== undefined) {
            parentUid = next['parentUid'];
          }
          const children = this.tree.treeModel.getNodeById(parentUid).data.children;
          const idx = children.findIndex(elem => Number(elem.id) === next.uid);
          if (idx !== -1) {
            children.splice(idx, 1);
          }
          this.tree.treeModel.getNodeById(parentUid).data.children = children;
          this.tree.treeModel.update();
          this.entitiesLoaded.delete(next.uid);
        }
    );

    this.browseEntityService.onNewWorkspace.pipe(
        concatMap(workspaceId => this.browseEntityService.retrieveWorkspaceEntity(workspaceId)),
        tap(entity => {
            const newNode = {
                name: entity.name,
                id: entity.uid.toString(),
                children: null,
                isLoading: false,
                svgIcon: DMEntityUtils.dmEntityIsWorkspace(entity) ? 'workspace' : 'folder'
            };
            this.nodes.push(newNode);
            this.tree.treeModel.update();
            this.entitiesLoaded.set(entity.uid, entity);
            this.browseEntityService.entities.set(entity.uid, entity);
            this.treeNodesService.treeNodes = this.tree.treeModel.nodes;
        })
    ).subscribe(

    );

        this.browseEntityService.onAddedChildToEntity$.pipe(
            concatMap(
                entityUid => combineLatest(of(entityUid), this.browseEntityService.findContainerEntitiesAtPath(entityUid))
            ),
            tap(([entityUid, childrenEntities]) => {
                const currentChildrenTmp = this.tree.treeModel.getNodeById(entityUid).data.children.slice();
                const currentChildren = currentChildrenTmp === null || currentChildrenTmp === undefined ?
                    [] :
                    currentChildrenTmp;
                const currentChildrenIds = currentChildren.map(childNode => Number(childNode.id));
                childrenEntities
                    .filter(entity => currentChildrenIds.indexOf(entity.uid) === -1)
                    .forEach(entity => {
                        currentChildren.push({
                            name: entity.name,
                            id: entity.uid.toString(),
                            children: null,
                            isLoading: false,
                            svgIcon: DMEntityUtils.dmEntityIsWorkspace(entity) ? 'workspace' : 'folder'
                        });
                    });
                this.tree.treeModel.getNodeById(entityUid).data.children = currentChildren;
                this.tree.treeModel.update();
                childrenEntities
                    .filter(entity => currentChildrenIds.indexOf(entity.uid) === -1)
                    .forEach(entity => this.loadChildren(entity.uid).subscribe());
            })
        ).subscribe();

        this.browseEntityService.chosenContainerEntityUid$.pipe(
            filter(res => res != null && res !== undefined),
            filter(res => this.mode === BROWSE_TREE_MODE.SEARCH_FORM_DIALOG),
            tap(res => this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(res)))
        ).subscribe();
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
                        entity => this.browseEntityService.findAllParents(entity.uid, true)
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
                isLoading: true,
                  svgIcon: DMEntityUtils.dmEntityIsWorkspace(entity) ? 'workspace' : 'folder'
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
                isLoading: false,
                  svgIcon: DMEntityUtils.dmEntityIsWorkspace(entity) ? 'workspace' : 'folder'
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
                isLoading: false,
                svgIcon: DMEntityUtils.dmEntityIsWorkspace(entityChild) ? 'workspace' : 'folder'
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
      if (this.mode === BROWSE_TREE_MODE.BROWSE) {
          this.browseEntityService.selectedEntityFromGridOrTree$.next(
              this.browseEntityService.entities.get(Number(uid))
          );
      } else {
          if (this.mode === BROWSE_TREE_MODE.SEARCH_FORM_DIALOG) {
              this.browseEntityService.chosenContainerEntityUid$.next(uid);
          }
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
                    isLoading: false,
                    svgIcon: DMEntityUtils.dmEntityIsWorkspace(entityChild) ? 'workspace' : 'folder'
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

  private updateMoveTreeNode(entityMoved: DMEntity, entityTarget: DMEntity, initialParentUid: number): void {
      const nodeToMove = this.tree.treeModel.getNodeById(entityMoved.uid);
      const nodeTarget = this.tree.treeModel.getNodeById(entityTarget.uid);
      const nodeFrom = this.tree.treeModel.getNodeById(initialParentUid);
      this.tree.treeModel.moveNode(
          nodeToMove, {
              dropOnNode: false,
              index: nodeToMove.data.children.length,
              parent: nodeTarget
          }, {
              parent: nodeFrom
          });
      this.tree.treeModel.update();
  }

    onFocus($event): void {
        this.browseEntityService.selectedEntityFromGridOrTree$.next(this.browseEntityService.entities.get(Number($event.node.data.id)));
    }

    openEntityData(uid: number): void {
        const dialogRef = this.containerEntityDialog.open(ContainerEntityDialogComponent, {
            width: '700px',
            // width: '250px',
            data: {
                uid: uid
            }
        });
    }

    handleDrop($event: DragEvent): void {
        if ($event['droppedInDir']) {
            $event['droppedInDir'] = this.browseEntityService.entities.get(Number($event['droppedInDir']));
        }
    }

    showProperties(entityId: number): void {
        console.log('entityId is ' + entityId);
    }

    createFolderDialog(entityId: number): void {
        this.openDialog('folder', entityId);
    }

    private openDialog(entityType: 'workspace' | 'folder', entityId: number): void {
        const dialogRef = this.createContainerEntityDialog.open(ContainerEntityCreationDialogComponent, {
            width: '60%',
            height: '75%',
            data: {
                entityType: entityType,
                parentId: entityId
            }
        });
    }
}
