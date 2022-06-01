import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DMEntityWrapper} from '../../../kimios-client-api/model/dMEntityWrapper';
import {BehaviorSubject, combineLatest, from, Observable, of, Subject} from 'rxjs';
import {concatMap, filter, map, switchMap, takeUntil, tap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from '../../utils/dmentity-utils';
import {BROWSE_TREE_MODE} from '../../model/browse-tree-mode.enum';
import {DMEntity, Document as KimiosDocument, Folder} from '../../../kimios-client-api';
import {ITreeModel, ITreeNode} from 'angular-tree-component/dist/defs/api';
import {ContainerEntityDialogComponent} from '../container-entity-dialog/container-entity-dialog.component';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {ContainerEntityCreationDialogComponent} from '../container-entity-creation-dialog/container-entity-creation-dialog.component';
import {MatCheckboxChange, MatDialog, MatDialogRef} from '@angular/material';
import {TreeModel, TreeNode} from 'angular-tree-component';
import {TreeNodesService} from '../../../services/tree-nodes.service';
import {BrowseEntityService} from '../../../services/browse-entity.service';
import {ActivatedRoute} from '@angular/router';
import {EntityCreationService} from '../../../services/entity-creation.service';
import {IconService} from '../../../services/icon.service';
import {EntityCacheService} from '../../../services/entity-cache.service';
import {DocumentDetailService} from '../../../services/document-detail.service';
import {SessionService} from '../../../services/session.service';

@Component({
  selector: 'app-browse-tree-base',
  templateUrl: './browse-tree-base.component.html',
  styleUrls: ['./browse-tree-base.component.scss']
})
export class BrowseTreeBaseComponent implements OnInit {

  unsubscribeSubject$ = new Subject();

  @Input()
  entityId: number;
  @Input()
  mode: BROWSE_TREE_MODE = BROWSE_TREE_MODE.BROWSE;

  entitiesToExpand$: BehaviorSubject<Array<DMEntity>>;
  nodeUidsToExpand: Array<number>;
  initDataDone$: BehaviorSubject<boolean>;
  selectedEntityIdList: Array<number>;

  toBeInsertedInTree: Array<Folder | KimiosDocument | Array<Folder | KimiosDocument>>;

  containerEntityDialogRef: MatDialogRef<ContainerEntityDialogComponent>;

  showNodeMenuButton = undefined;
  initial = true;
  onlyContainersInTree = true;

  @ViewChild('tree') tree;
  @ViewChild('tree') treeElement: ElementRef;
  @ViewChild('.node-content-wrapper-focused') focusedNode: ElementRef;

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
    protected treeNodesService: TreeNodesService,
    protected browseEntityService: BrowseEntityService,
    private route: ActivatedRoute,
    private entityCreationService: EntityCreationService,
    public containerEntityDialog: MatDialog,
    public createContainerEntityDialog: MatDialog,
    public confirmDialog: MatDialog,
    private iconService: IconService,
    protected entityCacheService: EntityCacheService,
    private documentDetailService: DocumentDetailService,
    protected cdRef: ChangeDetectorRef,
    private sessionService: SessionService
  ) {
    this.entitiesToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.initDataDone$ = new BehaviorSubject(false);
    this.nodeUidsToExpand = new Array<number>();
    // this.entitiesLoaded = new Map<number, DMEntity>();
    this.selectedEntityIdList = new Array<number>();
    this.toBeInsertedInTree = new Array<Folder | KimiosDocument | Array<Folder | KimiosDocument>>();
    this.onlyContainersInTree = (this.mode !== BROWSE_TREE_MODE.WITH_DOCUMENTS);
  }

  ngOnInit(): void {
    this.entityCacheService.folderWithChildren$.pipe(
      takeUntil(this.unsubscribeSubject$),
      concatMap(entity => combineLatest(
        of(entity),
        this.entityCacheService.findEntityChildrenInCache(entity.uid, this.mode !== BROWSE_TREE_MODE.WITH_DOCUMENTS)
      )),
      tap(([entity, childrenWrapperList]) => {
        const parentNode = this.tree.treeModel.getNodeById(entity.uid);
        if (parentNode == null) {
          this.toBeInsertedInTree.push(childrenWrapperList.map(wrapper => wrapper.dmEntity));
        } else {
          if (childrenWrapperList.length === 0) {
            parentNode.data.isLoading = false;
            this.tree.treeModel.update();
          } else {
            const existingChildrenIdList = parentNode.data.children == null ?
              [] :
              parentNode.data.children.map(child => child.id);
            this.toBeInsertedInTree.push(
              childrenWrapperList
                .filter(wrapper => !existingChildrenIdList.includes(wrapper.dmEntity.uid))
                .map(wrapper => wrapper.dmEntity)
            );
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

  retrieveFoldersAndInsertInTree(entities: Array<DMEntityWrapper>): Observable<any> {
    return from(entities).pipe(
      concatMap(entityWrapper => this.entityCacheService.reloadEntityChildren(entityWrapper.dmEntity.uid)),
      map(children => children.filter(child => DMEntityUtils.dmEntityIsFolder(child.dmEntity))),
      tap(folders => this.toBeInsertedInTree.push(folders.map(folderWrapper => folderWrapper.dmEntity))),
      tap(() => this.tryToInsertEntitiesInTree()),
      toArray()
      // tap(() => this.tree.treeModel.getNodeById(entity.uid).expand())
    );
  }

  retrieveEntitiesToExpand(): Observable<Array<DMEntityWrapper>> {
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
              entity => this.entityCacheService.findAllParentWrappers(entity.uid, true)
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
*/
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
      /*tap(
        ([entityUidRet, entities]) => entities.forEach(entWrapper => this.entitiesLoaded.set(entWrapper.dmEntity.uid, entWrapper.dmEntity))
      ),*/
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
        this.tree.treeModel.setFocusedNode(node);
      } else {
        if (this.mode === BROWSE_TREE_MODE.CHOOSE_PARENT) {
          this.entityCacheService.chosenParentUid$.next(Number(node.id.toString()));
          this.tree.treeModel.setFocusedNode(node);
        }
      }
    }
  }

  onToggleExpanded(event): void {
    const node = this.tree.treeModel.getNodeById(event.node.id);
    if (node.data.children == null) {
      return;
    }
    const notLoadedChildren = node.data.children
      // only ask children for folders
      .filter(child => child.dmEntityType && child.dmEntityType === 'folder')
      // only if not loaded
      .filter(child => child.data == null || child.data.children == null);
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

  protected updateMoveTreeNode(entityMoved: DMEntity, entityTarget: DMEntity, initialParentUid: number): void {
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

  protected tryToInsertEntitiesInTree(): void {
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
            if (parentNode != null) {
              entity.forEach(ent => this.insertEntityInTree(ent as DMEntity, this.tree.treeModel, this.nodes, false));
              parentNode.data.isLoading = false;
              parentNode.data.children.sort((a, b) => a.name.localeCompare(b.name));
              this.tree.treeModel.update();
              inserted++;
            }
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

  protected updateNodeData(nodes: any[], treeModel: TreeModel, folder: DMEntity): void {
    console.dir(folder);
    treeModel.getNodeById(folder.uid).name = folder.name;
  }

  protected removeNode(treeModel: TreeModel, nodes: any[], workspaceId: number): void {
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

  protected createNodeFromEntity(entity: DMEntity, loading = true): any {
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

  private appendEntitiesRec(entities: Array<DMEntityWrapper>, treeModel: TreeModel): Observable<boolean> {
    entities.forEach(entityWrapper => this.insertEntityInTree(entityWrapper.dmEntity, treeModel, this.nodes, false));
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
      let parentNode = null;
      if (DMEntityUtils.dmEntityIsFolder(entity)) {
        parentNode = treeModel.getNodeById((entity as Folder).parentUid);
      } else {
        parentNode = treeModel.getNodeById((entity as KimiosDocument).folderUid);
      }
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

  protected addNode(newNode: any, nodes: any[]): void {
    nodes.push(newNode);
    this.treeNodesService.addNode(newNode, this.mode);
  }

  public displayNodeMenuButton(id: number): void {
    this.showNodeMenuButton = id;
  }

  public hideNodeMenuButton(): void {
    this.showNodeMenuButton = undefined;
  }

  protected entitiesLoadedInTree(entities: Array<DMEntityWrapper>, treeModel: TreeModel): boolean {
    return entities.every(entityWrapper => treeModel.getNodeById(entityWrapper.dmEntity.uid) !== null);
  }

  protected loadEntitiesToExpand(entitiesParam: Array<DMEntityWrapper>): Observable<any> {
    return combineLatest(
      of(entitiesParam),
      this.entityCacheService.findEntityChildrenInCache(null, true)
    ).pipe(
      tap(([entities, workspaces]) => this.appendEntitiesRec(
        entities,
        this.tree.treeModel
      )),
      map(([entities, workspaces]) => {
        workspaces.forEach(workspaceWrapper => {
          const newNode = this.createNodeFromEntity(workspaceWrapper.dmEntity);
          if (this.tree.treeModel.getNodeById(newNode.id) == null) {
            this.addNode(newNode, this.nodes);
            this.cdRef.detectChanges();
            this.tree.treeModel.update();
            this.cdRef.detectChanges();
          }
        });
        return ([entities, workspaces]);
      }),
      tap(([entities, workspaces]) => console.dir(entities)),
      /*concatMap(([entities, workspaces]) =>
        combineLatest(
          of(entities),
          of(workspaces)
        )
      ),*/
      concatMap(([entities, workspaces]) => combineLatest(
        of(entities),
        of(workspaces),
        this.retrieveFoldersAndInsertInTree(entities)
      )),
      tap(([entities, workspaces]) => entities.forEach(entity => {
        if (! DMEntityUtils.dmEntityIsDocument(entity.dmEntity)
          && this.tree.treeModel.expandedNodes.filter(node => node.data.id === entity.dmEntity.uid.toString()).length === 0
          && this.tree.treeModel.getNodeById(entity.dmEntity.uid) != null
        ) {
          this.tree.treeModel.getNodeById(entity.dmEntity.uid).expand();
        }
      })),
      tap(([entities, workspaces]) => this.entityCacheService.askFoldersInFolders([entities[entities.length - 1].dmEntity.uid])),
      tap(([entities, workspaces]) =>
        this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entities[entities.length - 1].dmEntity.uid))
      ),
      /*tap(([entities, workspaces]) =>
        this.browseEntityService.selectedEntityFromGridOrTree$.next(
          this.entityCacheService.getEntity(entities[entities.length - 1].uid)
        )
      ),*/
      concatMap(([entities, workspaces]) =>
        this.entityCacheService.askFoldersInFolders(workspaces.map(workspace => workspace.dmEntity.uid))
      )
    );
  }

  protected expandEntitiesToExpand(entities: Array<DMEntityWrapper>): Observable<any> {
    entities.forEach(entityWrapper => this.tree.treeModel.getNodeById(entityWrapper.dmEntity.uid).expand());
    return of('');
  }

  protected scrollToFocusedNode(): void {
    const els = document.getElementsByClassName('node-content-wrapper-focused');
    console.dir(els);
    if (els.length === 0) {
      return;
    }
    const element = els[0];
    element.scrollIntoView();
  }

}
