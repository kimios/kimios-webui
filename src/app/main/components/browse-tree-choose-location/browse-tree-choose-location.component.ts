import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, from, iif, Observable, of} from 'rxjs';
import {DMEntity, Document as KimiosDocument, Folder} from 'app/kimios-client-api';
import {TreeNodesService} from 'app/services/tree-nodes.service';
import {concatMap, filter, flatMap, map, mergeMap, switchMap, take, tap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {ActivatedRoute} from '@angular/router';
import {EntityCreationService} from 'app/services/entity-creation.service';
import {ContainerEntityDialogComponent} from 'app/main/components/container-entity-dialog/container-entity-dialog.component';
import {MatCheckboxChange, MatDialog} from '@angular/material';
import {ContainerEntityCreationDialogComponent} from 'app/main/components/container-entity-creation-dialog/container-entity-creation-dialog.component';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';
import {ITreeModel, ITreeNode} from 'angular-tree-component/dist/defs/api';
import {IconService} from 'app/services/icon.service';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {DocumentDetailService} from 'app/services/document-detail.service';

@Component({
  selector: 'browse-tree-choose-location',
  templateUrl: './browse-tree-choose-location.component.html',
  styleUrls: ['./browse-tree-choose-location.component.scss']
})
export class BrowseTreeChooseLocationComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @Input()
  entityId: number;
  @Input()
  mode: BROWSE_TREE_MODE = BROWSE_TREE_MODE.BROWSE;

  entitiesToExpand$: BehaviorSubject<Array<DMEntity>>;
  nodeUidsToExpand: Array<number>;
  initDataDone$: BehaviorSubject<boolean>;
  entitiesLoaded: Map<number, DMEntity>;
  selectedEntityIdList: Array<number>;

  toBeInsertedInTree: Array<DMEntity>;

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
    private iconService: IconService,
    private entityCacheService: EntityCacheService,
    private documentDetailService: DocumentDetailService,
    private cdRef: ChangeDetectorRef
  ) {
    this.entitiesToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.initDataDone$ = new BehaviorSubject(false);
    this.nodeUidsToExpand = new Array<number>();
    this.entitiesLoaded = new Map<number, DMEntity>();
    this.selectedEntityIdList = new Array<number>();
  }

  ngOnInit(): void {
    this.browseEntityService.browseMode$.next(this.mode);

    if (this.treeNodesService.getTreeNodes(this.mode) != null) {
      this.nodes = this.treeNodesService.getTreeNodes(this.mode);
      this.tree.treeModel.update();
    }

    this.browseEntityService.updateMoveTreeNode$.pipe(
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
      filter(entityWrapper => entityWrapper != null && DMEntityUtils.dmEntityIsFolder(entityWrapper.dmEntity)),
      tap(entityWrapper => {
        const parentNode = this.tree.treeModel.getNodeById(
          DMEntityUtils.dmEntityIsDocument(entityWrapper.dmEntity) ?
            (entityWrapper.dmEntity as KimiosDocument).folderUid :
            (entityWrapper.dmEntity as Folder).parentUid
        );
        if (parentNode == null) {
          this.toBeInsertedInTree.push(entityWrapper.dmEntity);
        } else {
          this.tryToInsertEntitiesInTree();
        }
      })
    ).subscribe();

    this.entityCacheService.reloadedEntity$.pipe(
      filter(entity => entity != null),
      tap(entity => { if (this.tree.treeModel.getNodeById(entity.uid) != null) {
        this.tree.treeModel.getNodeById(entity.uid).data['name'] = entity.name;
      }})
    ).subscribe();

    this.browseEntityService.selectedEntityFromGridOrTree$.pipe(
      filter(entity => entity != null),
      filter(entity => this.browseEntityService.browseMode$.getValue() === BROWSE_TREE_MODE.BROWSE),
      tap(entity => { if (this.tree.treeModel.getNodeById(entity.uid) != null) {
        this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entity.uid));
      }})
    ).subscribe();
  }

  ngAfterViewInit(): void {

    // load initial nodes
    if (this.treeNodesService.getTreeNodes(this.mode) != null) {
      // if (this.browseEntityService.selectedEntity$.)
      this.initDataDone$.next(true);
    } else {
      this.retrieveEntitiesToExpand().pipe(
        tap(res => this.entitiesToExpand$.next(res)),
        concatMap(res => this.entityCacheService.findEntityChildrenInCache(null, true)),
        take(1),
        flatMap(
          res => res
        ),
        map(
          entityWrapper => {
            if (this.tree.treeModel.getNodeById(entityWrapper.dmEntity.uid) === undefined) {
              const newNode = {
                name: entityWrapper.dmEntity.name,
                id: entityWrapper.dmEntity.uid.toString(),
                children: null,
                isLoading: true,
                allowDrop: true,
                svgIcon: DMEntityUtils.determinePropertyValue(entityWrapper.dmEntity, 'workspace', 'folder', ''),
                dmEntityType: DMEntityUtils.determinePropertyValue(entityWrapper.dmEntity, 'workspace', 'folder', 'document'),
                documentExtension: DMEntityUtils.dmEntityIsDocument(entityWrapper.dmEntity) ?
                  (entityWrapper.dmEntity as KimiosDocument).extension ?
                    (entityWrapper.dmEntity as KimiosDocument).extension :
                    '' :
                  '',
                selected: false
              };
              this.nodes.push(newNode);
              this.tree.treeModel.update();
              this.entitiesLoaded.set(entityWrapper.dmEntity.uid, entityWrapper.dmEntity);
            }
            return entityWrapper.dmEntity;
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
      );
    }

    this.initDataDone$
      .pipe(
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
        this.treeNodesService.setTreeNodes(this.tree.treeModel.nodes, this.mode);
      })
    ).subscribe();

    this.browseEntityService.onAddedChildToEntity$.pipe(
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
          .filter(entityWrapper => currentChildrenIds.indexOf(entityWrapper.dmEntity.uid) === -1)
          .forEach(entityWrapper => {
            currentChildren.push({
              name: entityWrapper.dmEntity.name,
              id: entityWrapper.dmEntity.uid.toString(),
              children: null,
              isLoading: false,
              svgIcon: DMEntityUtils.determinePropertyValue(entityWrapper.dmEntity, 'workspace', 'folder', ''),
              dmEntityType: DMEntityUtils.determinePropertyValue(entityWrapper.dmEntity, 'workspace', 'folder', 'document'),
              documentExtension: DMEntityUtils.dmEntityIsDocument(entityWrapper.dmEntity) ?
                (entityWrapper.dmEntity as KimiosDocument).extension ?
                  (entityWrapper.dmEntity as KimiosDocument).extension :
                  '' :
                '',
              selected: false
            });
          });
        this.tree.treeModel.getNodeById(entityUid).data.children = (currentChildren as Array<any>)
          .sort((n1, n2) => n1.name.localeCompare(n2.name));
        this.tree.treeModel.update();
        childrenEntities
          .filter(entityWrapper => currentChildrenIds.indexOf(entityWrapper.dmEntity.uid) === -1)
          .forEach(entityWrapper => this.loadChildren(entityWrapper.dmEntity.uid).subscribe());
      })
    ).subscribe();

    this.browseEntityService.chosenContainerEntityUid$.pipe(
      filter(res => res != null && res !== undefined),
      filter(res => this.mode === BROWSE_TREE_MODE.SEARCH_FORM_DIALOG),
      tap(res => this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(res)))
    ).subscribe();

    this.entityCacheService.chosenParentUid$.pipe(
      filter(res => res != null && res !== undefined),
      filter(res => this.mode === BROWSE_TREE_MODE.CHOOSE_PARENT),
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
              entity => this.entityCacheService.findAllParents(entity.uid, true)
            ),
            map(entities => entities.reverse())
          )
      )
    );
  }

  /*loadNodeAndChildren(entity: DMEntity): Observable<DMEntity> {
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
          this.nodes.push(newNode);
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
  }*/

  loadChildren(entityUid: number): Observable<number> {
    this.tree.treeModel.getNodeById(entityUid.toString()).data.isLoading = true;
    return combineLatest(
      of(entityUid),
      this.entityCacheService.findEntityChildrenInCache(entityUid, this.mode !== BROWSE_TREE_MODE.WITH_DOCUMENTS)
    ).pipe(
      tap(
        ([entityUidRet, entities]) => this.tree.treeModel.getNodeById(entityUid).data.children = entities.map(entityWrapperChild => {
          return {
            name: entityWrapperChild.dmEntity.name,
            id: entityWrapperChild.dmEntity.uid.toString(),
            children: null,
            isLoading: false,
            svgIcon: DMEntityUtils.determinePropertyValue(entityWrapperChild.dmEntity, 'workspace', 'folder', ''),
            dmEntityType: DMEntityUtils.determinePropertyValue(entityWrapperChild.dmEntity, 'workspace', 'folder', 'document'),
            documentExtension: DMEntityUtils.dmEntityIsDocument(entityWrapperChild.dmEntity) ?
              (entityWrapperChild.dmEntity as KimiosDocument).extension ?
                (entityWrapperChild.dmEntity as KimiosDocument).extension :
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
        ([entityUidRet, entities]) => entities.forEach(entWrapper => this.entitiesLoaded.set(entWrapper.dmEntity.uid, entWrapper.dmEntity))
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
          () => this.tree.treeModel.getNodeById(res).data.children === null
            && this.tree.treeModel.getNodeById(res).data.dmEntityType !== 'document',
          this.loadChildren(res),
          of(res)
        )
      ),
      tap(res => this.tree.treeModel.getNodeById(res).expand())
    );
  }

  selectNode(node: ITreeNode): void {
    if (this.mode === BROWSE_TREE_MODE.BROWSE) {
      this.browseEntityService.selectedEntityFromGridOrTree$.next(
        this.entityCacheService.getEntity(Number(node.id))
      );
      node.expand();
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
        child => combineLatest(
          of(child['id']),
          this.entityCacheService.findEntityChildrenInCache(child['id'], this.mode !== BROWSE_TREE_MODE.WITH_DOCUMENTS)
        )),
      tap(
        ([parentUid, entities]) => this.tree.treeModel.getNodeById(parentUid).data.children = entities.length === 0 ?
          [] :
          entities.map(entityWrapperChild => {
            return {
              name: entityWrapperChild.dmEntity.name,
              id: entityWrapperChild.dmEntity.uid.toString(),
              children: null,
              isLoading: false,
              svgIcon: DMEntityUtils.determinePropertyValue(entityWrapperChild.dmEntity, 'workspace', 'folder', ''),
              dmEntityType: DMEntityUtils.determinePropertyValue(entityWrapperChild.dmEntity, 'workspace', 'folder', 'document'),
              documentExtension: DMEntityUtils.dmEntityIsDocument(entityWrapperChild.dmEntity) ?
                (entityWrapperChild.dmEntity as KimiosDocument).extension ?
                  (entityWrapperChild.dmEntity as KimiosDocument).extension :
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
        ([parentUid, entities]) => entities.forEach(entWrapper => this.entitiesLoaded.set(entWrapper.dmEntity.uid, entWrapper.dmEntity))
      )
    ).subscribe(
      ([parentUid, entities]) => this.tree.treeModel.getNodeById(parentUid).data.isLoading = false,
      null,
      null
    );
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
      $event['droppedInDir'] = this.entityCacheService.getEntity(Number($event['droppedInDir']));
    }
  }

  showProperties(entityId: number): void {
    // console.log('entityId is ' + entityId);
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
        const parentNode = this.tree.treeModel.getNodeById(
          DMEntityUtils.dmEntityIsDocument(entity) ?
            (entity as KimiosDocument).folderUid :
            (entity as Folder).parentUid
        );
        if (parentNode != null) {
          parentNode.data.children.push({
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
          this.tree.treeModel.update();
          inserted++;
          this.toBeInsertedInTree.splice(idx, 1);
        }
      });
    } while (inserted > 0 && this.toBeInsertedInTree.length > 0);
  }
}
