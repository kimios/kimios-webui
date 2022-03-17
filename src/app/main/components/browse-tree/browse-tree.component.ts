import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, from, Observable, of, Subject} from 'rxjs';
import {DMEntity, Document as KimiosDocument, Folder} from 'app/kimios-client-api';
import {TreeNodesService} from 'app/services/tree-nodes.service';
import {concatMap, filter, flatMap, map, switchMap, takeUntil, tap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {ActivatedRoute} from '@angular/router';
import {EntityCreationService} from 'app/services/entity-creation.service';
import {ContainerEntityDialogComponent} from 'app/main/components/container-entity-dialog/container-entity-dialog.component';
import {MatCheckboxChange, MatDialog, MatDialogRef} from '@angular/material';
import {ContainerEntityCreationDialogComponent} from 'app/main/components/container-entity-creation-dialog/container-entity-creation-dialog.component';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';
import {ITreeModel, ITreeNode} from 'angular-tree-component/dist/defs/api';
import {IconService} from 'app/services/icon.service';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {SessionService} from 'app/services/session.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {TreeModel, TreeNode} from 'angular-tree-component';

@Component({
  selector: 'browse-tree',
  templateUrl: './browse-tree.component.html',
  styleUrls: ['./browse-tree.component.scss']
})
export class BrowseTreeComponent implements OnInit, AfterViewInit, AfterViewChecked {

  unsubscribeSubject$ = new Subject();

  @Input()
  entityId: number;
  @Input()
  mode: BROWSE_TREE_MODE = BROWSE_TREE_MODE.BROWSE;

  entitiesToExpand$: BehaviorSubject<Array<DMEntity>>;
  nodeUidsToExpand: Array<number>;
  initDataDone$: BehaviorSubject<boolean>;
  entitiesLoaded: Map<number, DMEntity>;
  selectedEntityIdList: Array<number>;

  toBeInsertedInTree: Array<Folder | KimiosDocument | Array<Folder | KimiosDocument>>;

  containerEntityDialogRef: MatDialogRef<ContainerEntityDialogComponent>;

  showNodeMenuButton = undefined;

  @ViewChild('tree') tree;
  @ViewChild('tree') treeElement: ElementRef;

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
      public createContainerEntityDialog: MatDialog,
      public confirmDialog: MatDialog,
      private iconService: IconService,
      private entityCacheService: EntityCacheService,
      private documentDetailService: DocumentDetailService,
      private cdRef: ChangeDetectorRef,
      private sessionService: SessionService
  ) {
    this.entitiesToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.initDataDone$ = new BehaviorSubject(false);
    this.nodeUidsToExpand = new Array<number>();
    this.entitiesLoaded = new Map<number, DMEntity>();
    this.selectedEntityIdList = new Array<number>();
    this.toBeInsertedInTree = new Array<Folder | KimiosDocument | Array<Folder | KimiosDocument>>();
  }

  ngOnInit(): void {
      this.browseEntityService.browseMode$.next(this.mode);

    if (this.treeNodesService.getTreeNodes(this.mode) != null) {
      this.nodes = this.treeNodesService.getTreeNodes(this.mode);
      this.tree.treeModel.update();
    }

      this.browseEntityService.updateMoveTreeNode$.pipe(
        takeUntil(this.unsubscribeSubject$),
        filter(next => next != null)
      ).subscribe(
          next => this.updateMoveTreeNode(next.entityMoved, next.entityTarget, next.initialParentUid)
      );

    /*this.entityCreationService.onFormSubmitted$.pipe(
        concatMap( next => this.browseEntityService.retrieveContainerEntity(next))
    ).subscribe(
        next => updateTree
    )*/
    this.entityCacheService.newEntity$.pipe(
      takeUntil(this.unsubscribeSubject$),
      filter(entity => entity != null && DMEntityUtils.dmEntityIsFolder(entity)),
      tap(entity => {
        const parentNode = this.tree.treeModel.getNodeById(
          DMEntityUtils.dmEntityIsDocument(entity) ?
            (entity as KimiosDocument).folderUid :
            (entity as Folder).parentUid
        );
        if (parentNode == null) {
          this.toBeInsertedInTree.push(entity);
        } else {
          this.tryToInsertEntitiesInTree();
        }
      })
    ).subscribe();

    this.entityCacheService.reloadedEntity$.pipe(
      takeUntil(this.unsubscribeSubject$),
      filter(entity => entity != null),
      tap(entity => { if (this.tree.treeModel.getNodeById(entity.uid) != null) {
        this.tree.treeModel.getNodeById(entity.uid).data['name'] = entity.name;
      }})
    ).subscribe();

    this.browseEntityService.selectedEntityFromGridOrTree$.pipe(
      takeUntil(this.unsubscribeSubject$),
      filter(entity => entity != null),
      filter(entity => this.browseEntityService.browseMode$.getValue() === BROWSE_TREE_MODE.BROWSE),
      tap(entity => { if (entity != null && this.tree.treeModel.getNodeById(entity.uid) != null) {
        this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entity.uid));
      }})
    ).subscribe();

    this.entityCacheService.workspaceCreated$.pipe(
      takeUntil(this.unsubscribeSubject$),
      tap(workspaceId => this.browseEntityService.onNewWorkspace.next(workspaceId))
    ).subscribe();
    this.entityCacheService.workspaceUpdated$.pipe(
      takeUntil(this.unsubscribeSubject$),
      concatMap(workspaceId => this.entityCacheService.findContainerEntityInCache(workspaceId)),
      tap(workspace => this.updateNodeData(this.nodes, this.tree.treeModel, workspace))
    ).subscribe();
    this.entityCacheService.workspaceRemoved$.pipe(
      takeUntil(this.unsubscribeSubject$),
      tap(workspaceId => this.removeNode(this.tree.treeModel, this.nodes, workspaceId))
    ).subscribe();

    this.entityCacheService.folderCreated$.pipe(
      takeUntil(this.unsubscribeSubject$),
      concatMap(folderId => this.entityCacheService.findContainerEntityInCache(folderId)),
      concatMap(folder => this.entityCacheService.findContainerEntityInCache((folder as Folder).parentUid)),
      tap(parentFolder => this.browseEntityService.onAddedChildToEntity$.next(parentFolder.uid))
    ).subscribe();
    this.entityCacheService.folderUpdated$.pipe(
      takeUntil(this.unsubscribeSubject$),
      concatMap(folderId => this.entityCacheService.findContainerEntityInCache(folderId)),
      tap(folder => this.updateNodeData(this.nodes, this.tree.treeModel, folder))
    ).subscribe();
    this.entityCacheService.folderRemoved$.pipe(
      takeUntil(this.unsubscribeSubject$),
      tap(folderId => this.removeNode(this.tree.treeModel, this.nodes, folderId)),
    ).subscribe();

    this.entityCacheService.folderWithChildren$.pipe(
      takeUntil(this.unsubscribeSubject$),
      concatMap(entity => combineLatest(
        of(entity),
        this.entityCacheService.findEntityChildrenInCache(entity.uid, true)
      )),
      tap(([entity, children]) => {
        const parentNode = this.tree.treeModel.getNodeById(entity.uid);
        if (parentNode == null) {
          this.toBeInsertedInTree.push(children);
        } else {
          if (children.length === 0) {
            parentNode.data.isLoading = false;
            this.tree.treeModel.update();
          } else {
            const existingChildrenIdList = parentNode.data.children == null ?
              [] :
              parentNode.data.children.map(child => child.id);
            this.toBeInsertedInTree.push(children.filter(child =>
              !existingChildrenIdList.includes(child.uid)
            ));
          }
          this.tryToInsertEntitiesInTree();

          /*parentNode.data.children = [];
          children
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(child => {
              const node = this.createNodeFromEntity(child);
              parentNode.data.children.push(node);
              this.entitiesLoaded.set(child.uid, child);
            });*/
          // this.cdRef.detectChanges();
        }
      })
    ).subscribe();
  }

    ngAfterViewInit(): void {

        // load initial nodes
        if (this.treeNodesService.getTreeNodes(this.mode) != null) {
            // if (this.browseEntityService.selectedEntity$.)
            // this.initDataDone$.next(true);

          this.retrieveEntitiesToExpand().pipe(
            takeUntil(this.unsubscribeSubject$),
            filter(entities => entities.length > 0),
            map(entities => this.entitiesLoadedInTree(entities, this.tree.treeModel) ? entities : []),
            concatMap(entities => entities.length > 0 ?
              this.expandEntitiesToExpand(entities) :
              this.loadEntitiesToExpand(entities)
            ),
            tap(entities =>
              this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entities[entities.length - 1].uid))
            )
          ).subscribe();
        } else {
          this.browseEntityService.selectedEntity$.pipe(
            takeUntil(this.unsubscribeSubject$),
            filter(selected => selected != null && selected !== undefined),
            concatMap(() => this.retrieveEntitiesToExpand()),
            filter(entities => entities.length > 0),
            concatMap(entities => this.loadEntitiesToExpand(entities))
          ).subscribe();

/*          this.retrieveEntitiesToExpand().pipe(
                tap(res => this.entitiesToExpand$.next(res)),
                concatMap(res => this.entityCacheService.findEntityChildrenInCache(null, true)),
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
                                svgIcon: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', ''),
                                dmEntityType: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', 'document'),
                                documentExtension: DMEntityUtils.dmEntityIsDocument(entity) ?
                                  (entity as KimiosDocument).extension ?
                                    (entity as KimiosDocument).extension :
                                    '' :
                                  '',
                              selected: false
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
                                )
                            ).pipe(
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
                  this.treeNodesService.setTreeNodes(this.tree.treeModel.nodes, this.mode);
                  this.cdRef.detectChanges();
                },
                null,
                () => {
                    this.initDataDone$.next(true);
                }
            );*/
        }

    this.initDataDone$
        .pipe(
          takeUntil(this.unsubscribeSubject$),
            filter(res => res === true),
            map(res => this.browseEntityService.selectedEntity$.getValue()),
            filter(entity => entity !== undefined),
            tap(entity => this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entity.uid))),
            filter(entity => this.tree.treeModel.getNodeById(entity.uid) != null),
            tap(entity => this.tree.treeModel.getNodeById(entity.uid).expand()),
            concatMap(
                entity => this.entityCacheService.findAllParents(entity.uid)
            ),
            flatMap(
                entities => entities.reverse()
            ),
            tap(entityRet => this.tree.treeModel.update()),
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
              this.treeNodesService.setTreeNodes(this.tree.treeModel.nodes, this.mode);
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

    this.browseEntityService.nodeToRemoveFromTree.pipe(
      takeUntil(this.unsubscribeSubject$),
    ).subscribe(
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
      takeUntil(this.unsubscribeSubject$),
        concatMap(workspaceId => this.browseEntityService.retrieveWorkspaceEntity(workspaceId)),
        tap(entity => {
          if (this.tree.treeModel.getNodeById(entity.uid) != null) {
            return;
          }
            const newNode = {
                name: entity.name,
                id: entity.uid.toString(),
                children: null,
                isLoading: false,
                svgIcon: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', ''),
                dmEntityType: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', 'document'),
                documentExtension: DMEntityUtils.dmEntityIsDocument(entity) ?
                  (entity as KimiosDocument).extension ?
                    (entity as KimiosDocument).extension :
                    '' :
                  '',
              selected: false
            };
            this.addNode(newNode, this.nodes);
            this.nodes.sort((n1, n2) => n1.name.localeCompare(n2.name));
            this.tree.treeModel.update();
            this.entitiesLoaded.set(entity.uid, entity);
            this.treeNodesService.setTreeNodes(this.tree.treeModel.nodes, this.mode);
        })
    ).subscribe();

        this.browseEntityService.onAddedChildToEntity$.pipe(
          takeUntil(this.unsubscribeSubject$),
            concatMap(entityUid => combineLatest(
              of(entityUid),
              this.entityCacheService.findEntityChildrenInCache(entityUid, true)
            )),
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
                            svgIcon: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', ''),
                            dmEntityType: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', 'document'),
                            documentExtension: DMEntityUtils.dmEntityIsDocument(entity) ?
                              (entity as KimiosDocument).extension ?
                                (entity as KimiosDocument).extension :
                                '' :
                              '',
                          selected: false
                        });
                    });
                this.tree.treeModel.getNodeById(entityUid).data.children = (currentChildren as Array<any>)
                  .sort((n1, n2) => n1.name.localeCompare(n2.name));
                this.tree.treeModel.update();
                childrenEntities
                    .filter(entity => currentChildrenIds.indexOf(entity.uid) === -1)
                    .forEach(entity => this.loadChildren(entity.uid).subscribe());
            })
        ).subscribe();

        this.browseEntityService.chosenContainerEntityUid$.pipe(
          takeUntil(this.unsubscribeSubject$),
            filter(res => res != null && res !== undefined),
            filter(res => this.mode === BROWSE_TREE_MODE.SEARCH_FORM_DIALOG),
            tap(res => this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(res)))
        ).subscribe();

        this.entityCacheService.chosenParentUid$.pipe(
          takeUntil(this.unsubscribeSubject$),
          filter(res => res != null && res !== undefined),
          filter(res => this.mode === BROWSE_TREE_MODE.CHOOSE_PARENT),
          tap(res => this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(res)))
        ).subscribe();
  }

  retrieveFoldersAndInsertInTree(entities: Array<DMEntity>): Observable<any> {
    return from(entities).pipe(
      concatMap(entity => this.entityCacheService.reloadEntityChildren(entity.uid)),
      map(children => children.filter(child => DMEntityUtils.dmEntityIsFolder(child))),
      tap(folders => this.toBeInsertedInTree.push(folders)),
      tap(() => this.tryToInsertEntitiesInTree()),
      toArray()
      // tap(() => this.tree.treeModel.getNodeById(entity.uid).expand())
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
        map(res => res !== 0 ?
          res :
          this.browseEntityService.selectedEntity$.getValue() != null
          && this.browseEntityService.selectedEntity$.getValue() !== undefined ?
            this.browseEntityService.selectedEntity$.getValue().uid :
            res
        ),
        concatMap(
            res => res === 0 ?
                of([]) :
                this.browseEntityService.retrieveContainerEntity(res).pipe(
                    /*tap(
                        entity => this.browseEntityService.selectedEntityFromGridOrTree$.next(entity)
                    ),*/
                    concatMap(
                        entity => this.entityCacheService.findAllParents(entity.uid, true)
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
                svgIcon: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', ''),
                dmEntityType: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', 'document'),
                documentExtension: DMEntityUtils.dmEntityIsDocument(entity) ?
                  (entity as KimiosDocument).extension ?
                    (entity as KimiosDocument).extension :
                    '' :
                  '',
                selected: false
              };
              this.addNode(newNode, this.nodes);
              this.tree.treeModel.update();
              this.entitiesLoaded.set(entityRet.uid, entityRet);
              return entityRet;
            }
        ),
        concatMap(entityRet => combineLatest(
              of(entityRet),
              this.entityCacheService.findEntityChildrenInCache(entityRet.uid, this.mode !== BROWSE_TREE_MODE.WITH_DOCUMENTS)
        )),
        tap(
            ([entityRet, entities]) => this.tree.treeModel.getNodeById(entityRet.uid).data.children = entities.map(entityChild => {
              return {
                name: entityChild.name,
                id: entityChild.uid.toString(),
                children: null,
                isLoading: false,
                svgIcon: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', ''),
                dmEntityType: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', 'document'),
                documentExtension: DMEntityUtils.dmEntityIsDocument(entity) ?
                  (entity as KimiosDocument).extension ?
                    (entity as KimiosDocument).extension :
                    '' :
                  '',
                selected: false
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
    return combineLatest(
      of(entityUid),
      this.entityCacheService.findEntityChildrenInCache(entityUid, this.mode !== BROWSE_TREE_MODE.WITH_DOCUMENTS)
    ).pipe(
        tap(
            ([entityUidRet, entities]) => this.tree.treeModel.getNodeById(entityUid).data.children = entities.map(entityChild => {
              return {
                name: entityChild.name,
                id: entityChild.uid.toString(),
                children: null,
                isLoading: false,
                svgIcon: DMEntityUtils.determinePropertyValue(entityChild, 'workspace', 'folder', ''),
                dmEntityType: DMEntityUtils.determinePropertyValue(entityChild, 'workspace', 'folder', 'document'),
                documentExtension: DMEntityUtils.dmEntityIsDocument(entityChild) ?
                  (entityChild as KimiosDocument).extension ?
                    (entityChild as KimiosDocument).extension :
                    '' :
                  '',
                selected: false
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
      concatMap(res => this.tree.treeModel.getNodeById(res).data.children == null
        && this.tree.treeModel.getNodeById(res).data.dmEntityType !== 'document' ?
        this.loadChildren(res) :
        of(res)
      ),
      tap(res => this.tree.treeModel.getNodeById(res).expand())
    );
  }

  selectNode(node: ITreeNode): void {
      if (this.mode === BROWSE_TREE_MODE.BROWSE) {
          this.browseEntityService.selectedEntityFromGridOrTree$.next(
              this.entityCacheService.getEntity(Number(node.id))
          );
          if (! node.isExpanded) {
            node.expand();
          }
      } else {
          if (this.mode === BROWSE_TREE_MODE.SEARCH_FORM_DIALOG) {
              this.browseEntityService.chosenContainerEntityUid$.next(Number(node.id.toString()));
          } else {
            if (this.mode === BROWSE_TREE_MODE.CHOOSE_PARENT) {
              this.entityCacheService.chosenParentUid$.next(Number(node.id.toString()));
            }
          }
      }
  }

  onToggleExpanded(event): void {
    const node = this.tree.treeModel.getNodeById(event.node.id);
    if (node.data.children == null) {
      return;
    }
    const notLoadedChildren = node.data.children.filter(child => child.data == null || child.data.children == null);
    if (notLoadedChildren.length === 0) {
      return;
    }
    notLoadedChildren.map(child => {
      if (child && child.data) {
        child.data.isLoading = true;
      }
    });
    this.entityCacheService.askFoldersInFolders(notLoadedChildren.map(child => child.id))
      .pipe(
        takeUntil(this.unsubscribeSubject$)
      ).subscribe();

    /*from(this.tree.treeModel.getNodeById(event.node.id).data.children.filter(child =>
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
            child => combineLatest(
              of(child['id']),
              this.entityCacheService.findEntityChildrenInCache(child['id'], this.mode !== BROWSE_TREE_MODE.WITH_DOCUMENTS)
        )),
        tap(
            ([parentUid, entities]) => this.tree.treeModel.getNodeById(parentUid).data.children = entities.length === 0 ?
                [] :
                entities.map(entityChild => {
                  return {
                    name: entityChild.name,
                    id: entityChild.uid.toString(),
                    children: null,
                    isLoading: false,
                    svgIcon: DMEntityUtils.determinePropertyValue(entityChild, 'workspace', 'folder', ''),
                    dmEntityType: DMEntityUtils.determinePropertyValue(entityChild, 'workspace', 'folder', 'document'),
                    documentExtension: DMEntityUtils.dmEntityIsDocument(entityChild) ?
                      (entityChild as KimiosDocument).extension ?
                        (entityChild as KimiosDocument).extension :
                        '' :
                      '',
                    selected: false
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
        null
    );*/
  }

  private updateMoveTreeNode(entityMoved: DMEntity, entityTarget: DMEntity, initialParentUid: number): void {
      const nodeToMove = this.tree.treeModel.getNodeById(entityMoved.uid);
      const nodeTarget = this.tree.treeModel.getNodeById(entityTarget.uid);
      const nodeFrom = this.tree.treeModel.getNodeById(initialParentUid);
      if (nodeToMove == null || nodeTarget == null || nodeFrom == null) {
        return;
      }

      this.tree.treeModel.moveNode(
          nodeToMove, {
              dropOnNode: false,
              // index: nodeToMove.data.children.length,
              parent: nodeTarget
          }, {
              parent: nodeFrom
          });
      const children = this.tree.treeModel.getNodeById(nodeTarget.id).data.children.slice();
      const childrenSorted = children.sort((n1, n2) => n1.name.localeCompare(n2.name));
      this.tree.treeModel.getNodeById(nodeTarget.id).data.children = childrenSorted;
      this.tree.treeModel.update();
  }

    onFocus($event): void {
        this.browseEntityService.selectedEntityFromGridOrTree$.next(this.entityCacheService.getEntity(Number($event.node.data.id)));
    }

    openEntityData(uid: number): void {
        this.containerEntityDialogRef = this.containerEntityDialog.open(ContainerEntityDialogComponent, {
            width: '700px',
            // width: '250px',
            data: {
                uid: uid
            },
          disableClose: true
        });

      this.containerEntityDialogRef.backdropClick().pipe(
        tap(() => { if (this.sessionService.dirtyForm$.getValue() === true) {
          this.openConfirmDialog('You have unsaved work', ['Any modification will be lost. Are you sure?']);
        } else {
          this.containerEntityDialogRef.close();
        }})
      ).subscribe();

      this.containerEntityDialogRef.afterClosed().pipe(
        tap(() => this.sessionService.dirtyForm$.next(false))
      ).subscribe();
    }

  openConfirmDialog(title: string, messageLines: Array<string>): void {
    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle: title,
        messageLine1: messageLines[0]
      }
    });

    dialogRef.afterClosed().pipe(
      filter(res => res === true),
      tap(() => this.containerEntityDialogRef.close())
    ).subscribe();
  }

    handleDrop($event: DragEvent): void {
        if ($event['droppedInDir']) {
            $event['droppedInDir'] = this.entityCacheService.getEntity(Number($event['droppedInDir']));
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
            // width: '60%',
            // height: '75%',
            data: {
                entityType: entityType,
                parentId: entityId
            },
          disableClose: true
        });
    }

  retrieveDocumentIcon(fileExtension: string, iconPrefix: string): string {
    return DMEntityUtils.retrieveEntityIconNameFromFileExtension(
      this.iconService,
      fileExtension,
      iconPrefix
    );
  }

  selectionChange($event: MatCheckboxChange, id: number): void {
    if ($event.checked === true) {
      this.selectedEntityIdList.push(id);
    } else {
      const idx = this.selectedEntityIdList.findIndex(element => element === id);
      if (idx !== -1) {
        this.selectedEntityIdList.splice(idx, 1);
      }
    }
    this.documentDetailService.selectedEntityIdList$.next(this.selectedEntityIdList);

    return;
  }

  selectedEntity(id: number): boolean {
    return this.selectedEntityIdList.includes(id);
  }

  setChildrenForNode(nodes: Array<any>, node: ITreeNode, children: Array<any>): Array<any> {
    const nodesUpdated = nodes.slice();

    node.data.children = children;
    const path = node.path;
    if (path[path.length - 1] === node.id) {
      path.pop();
    }
    const updatedRootNode = this.updateNodeRec(path.map(elem => Number(elem)), node, this.tree.treeModel);
    const idxToReplace = nodes.findIndex(n => n.id === updatedRootNode.id);
    if (idxToReplace !== -1) {
      nodesUpdated[idxToReplace] = updatedRootNode;
    }

    return nodesUpdated;
  }

  updateNodeRec(path: Array<number>, node: ITreeNode, treeModel: ITreeModel): ITreeNode {
    if (path.length === 0) {
      return node;
    } else {
      const id = path.pop();
      const nodeToUpdate = treeModel.getNodeById(id);
      const idxToReplace = nodeToUpdate.data.children.findIndex(n => n.id === node.id);
      if (idxToReplace !== -1) {
        nodeToUpdate.data.children[idxToReplace] = node;
      }
      return this.updateNodeRec(path, nodeToUpdate, treeModel);
    }
  }

  ngAfterViewChecked(): void {
    if (
      this.treeElement
      && this.treeElement['viewportComponent']
      && this.treeElement['viewportComponent'].elementRef
      && this.treeElement['viewportComponent'].elementRef.nativeElement
    ) {
      this.treeElement['viewportComponent'].elementRef.nativeElement.style.overflow = 'unset';
    }
  }

  private tryToInsertEntitiesInTree(): void {
    let inserted = 0;
    do {
      inserted = 0;
      const toBeInserted = this.toBeInsertedInTree.slice();
      toBeInserted.forEach((entity, idx) => {
        if (entity instanceof Array) {
          if (entity.length > 0) {
            const parentNode = this.tree.treeModel.getNodeById(
              DMEntityUtils.dmEntityIsDocument(entity[0] as DMEntity) ?
                (entity[0] as KimiosDocument).folderUid :
                (entity[0] as Folder).parentUid
            );
            entity.forEach(ent => this.insertEntityInTree(ent as DMEntity, this.tree.treeModel, this.nodes, false));
            parentNode.data.isLoading = false;
            parentNode.data.children.sort((a, b) => a.name.localeCompare(b.name));
            this.tree.treeModel.update();
            inserted++;
          }
          this.toBeInsertedInTree.splice(idx, 1);
        } else {
          const parentNode = this.tree.treeModel.getNodeById(
            DMEntityUtils.dmEntityIsDocument(entity as DMEntity) ?
              (this.entityCacheService.getDocumentCacheData((entity as DMEntity).uid).entity as KimiosDocument).folderUid :
              (this.entityCacheService.getEntityCacheData((entity as DMEntity).uid).entity as Folder).parentUid
          );
          if (parentNode != null) {
            /*parentNode.data.children.push({
              name: entity.name,
              id: entity.uid.toString(),
              children: null,
              isLoading: false,
              svgIcon: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', ''),
              dmEntityType: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', 'document'),
              documentExtension: DMEntityUtils.dmEntityIsDocument(entity) ?
                (entity as KimiosDocument).extension ?
                  (entity as KimiosDocument).extension :
                  '' :
                '',
              selected: false
            });*/
            this.insertEntityInTree(entity as DMEntity, this.tree.treeModel, this.nodes, false);
            this.tree.treeModel.update();
            inserted++;
            this.toBeInsertedInTree.splice(idx, 1);
          }
        }
      });
    } while (inserted > 0 && this.toBeInsertedInTree.length > 0);
  }

  /*private insertEntityInTree(nodes: Array<any>, treeModel: TreeModel, containerEntity: DMEntity): void {
    const parentNode = DMEntityUtils.dmEntityIsWorkspace(containerEntity) ?
      null :
      treeModel.getNodeById((containerEntity as Folder).parentUid);

    const node = {
      name: containerEntity.name,
        id: containerEntity.uid.toString(),
      children: null,
      isLoading: false,
      svgIcon: DMEntityUtils.determinePropertyValue(containerEntity, 'workspace', 'folder', ''),
      dmEntityType: DMEntityUtils.determinePropertyValue(containerEntity, 'workspace', 'folder', 'document'),
      selected: false
    };

    if (parentNode == null || parentNode === undefined) {
      nodes.push(node);
      nodes.sort((n1, n2) => n1.name.localeCompare(n2.name));
    } else {
      const children = parentNode.data.children;
      children.push(node);
      parentNode.data.children = children.sort((n1, n2) => n1.name.localeCompare(n2.name));
    }
    treeModel.update();
  }*/

  private updateNodeData(nodes: any[], treeModel: TreeModel, folder: DMEntity): void {
    console.dir(folder);
    treeModel.getNodeById(folder.uid).name = folder.name;
  }

  private removeNode(treeModel: TreeModel, nodes: any[], workspaceId: number): void {
    const node = treeModel.getNodeById(workspaceId);
    if (node == null) {
      return;
    }
    const parentNode = node.parent;
    const array = parentNode == null ?
      nodes :
      parentNode.data.children;
    const idx = array.findIndex(n => n.id === workspaceId.toString());
    if (idx !== -1) {
      array.splice(idx, 1);
    }
    treeModel.update();
  }

  private createNodeFromEntity(entity: DMEntity, loading = true): any {
    const newNode = {
      name: entity.name,
      id: entity.uid.toString(),
      children: null,
      isLoading: loading,
      allowDrop: true,
      svgIcon: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', ''),
      dmEntityType: DMEntityUtils.determinePropertyValue(entity, 'workspace', 'folder', 'document'),
      documentExtension: DMEntityUtils.dmEntityIsDocument(entity) ?
        (entity as KimiosDocument).extension ?
          (entity as KimiosDocument).extension :
          '' :
        '',
      selected: false
    };

    return newNode;
  }

  private appendEntitiesRec(entities: Array<DMEntity>, treeModel: TreeModel): Observable<boolean> {
    entities.forEach(entity => this.insertEntityInTree(entity, treeModel, this.nodes, false));
    return of(true);
  }

  private insertEntityInTree(entity: DMEntity, treeModel: TreeModel, nodes: TreeNode[], loading = true): void {
    const node = treeModel.getNodeById(entity.uid);
    if (node != null) {
      return;
    }
    if (DMEntityUtils.dmEntityIsWorkspace(entity)) {
      const workspaceNode = this.createNodeFromEntity(entity);
      this.addNode(workspaceNode, nodes);
    } else {
      const parentNode = treeModel.getNodeById((entity as Folder).parentUid);
      if (parentNode == null) {
        return;
      }
      if (parentNode.data == null) {
        parentNode.data = {};
      }
      if (parentNode.data.children == null) {
        parentNode.data.children = [];
      }
      parentNode.data.children.push(this.createNodeFromEntity(entity, loading));
    }
    treeModel.update();
  }

  private addNode(newNode: any, nodes: any[]): void {
    nodes.push(newNode);
    this.treeNodesService.addNode(newNode, this.mode);
  }

  public displayNodeMenuButton(id: number): void {
    this.showNodeMenuButton = id;
  }

  public hideNodeMenuButton(): void {
    this.showNodeMenuButton = undefined;
  }

  private entitiesLoadedInTree(entities: Array<DMEntity>, treeModel: TreeModel): boolean {
    return entities.every(entity => treeModel.getNodeById(entity.uid) !== null);
  }

  private loadEntitiesToExpand(entitiesParam: Array<DMEntity>): Observable<any> {
    return combineLatest(
      of(entitiesParam),
      this.entityCacheService.findEntityChildrenInCache(null, true)
    ).pipe(
    tap(([entities, workspaces]) => this.appendEntitiesRec(entities, this.tree.treeModel)),
      map(([entities, workspaces]) => {
        workspaces.forEach(workspace => {
          const newNode = this.createNodeFromEntity(workspace);
          if (this.tree.treeModel.getNodeById(newNode.id) == null) {
            this.addNode(newNode, this.nodes);
            // this.cdRef.detectChanges();
            this.tree.treeModel.update();
            this.entitiesLoaded.set(workspace.uid, workspace);
          }
        });
        return ([entities, workspaces]);
      }),
      tap(([entities, workspaces]) => console.dir(entities)),
      concatMap(([entities, workspaces]) =>
        combineLatest(
          of(entities),
          of(workspaces)
        )
      ),
      concatMap(([entities, workspaces]) => combineLatest(
        of(entities),
        of(workspaces),
        this.retrieveFoldersAndInsertInTree(entities)
      )),
      tap(([entities, workspaces]) => entities.forEach(entity => {
        if (! DMEntityUtils.dmEntityIsDocument(entity)
          && this.tree.treeModel.expandedNodes.filter(node => node.data.id === entity.uid.toString()).length === 0
        ) {
          this.tree.treeModel.getNodeById(entity.uid).expand();
        }
      })),
      tap(([entities, workspaces]) => this.entityCacheService.askFoldersInFolders([entities[entities.length - 1].uid])),
      tap(([entities, workspaces]) =>
        this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entities[entities.length - 1].uid))
      ),
      /*tap(([entities, workspaces]) =>
        this.browseEntityService.selectedEntityFromGridOrTree$.next(
          this.entityCacheService.getEntity(entities[entities.length - 1].uid)
        )
      ),*/
      concatMap(([entities, workspaces]) =>
        this.entityCacheService.askFoldersInFolders(workspaces.map(workspace => workspace.uid))
      )
    );
  }

  private expandEntitiesToExpand(entities: Array<DMEntity>): Observable<any> {
    entities.forEach(entity => this.tree.treeModel.getNodeById(entity.uid).expand());
    return of();
  }
}
