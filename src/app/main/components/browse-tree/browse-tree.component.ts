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
import {DMEntityWrapper} from 'app/kimios-client-api/model/dMEntityWrapper';
import {BrowseTreeBaseComponent} from '../browse-tree-base/browse-tree-base.component';

@Component({
  selector: 'browse-tree',
  templateUrl: './browse-tree.component.html',
  styleUrls: ['./browse-tree.component.scss']
})
export class BrowseTreeComponent extends BrowseTreeBaseComponent implements OnInit, AfterViewInit, AfterViewChecked {

  constructor(
    treeNodesService: TreeNodesService,
    browseEntityService: BrowseEntityService,
    route: ActivatedRoute,
    entityCreationService: EntityCreationService,
    containerEntityDialog: MatDialog,
    createContainerEntityDialog: MatDialog,
    confirmDialog: MatDialog,
    iconService: IconService,
    entityCacheService: EntityCacheService,
    documentDetailService: DocumentDetailService,
    cdRef: ChangeDetectorRef,
    sessionService: SessionService
  ) {
    super(
      treeNodesService,
      browseEntityService,
      route,
      entityCreationService,
      containerEntityDialog,
      createContainerEntityDialog,
      confirmDialog,
      iconService,
      entityCacheService,
      documentDetailService,
      cdRef,
      sessionService
    );
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
      }}),
      tap(() => {
        if (this.initial === true) {
          this.initial = false;
          this.scrollToFocusedNode();
        }
      })
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

    ngAfterViewInit(): void {

        // load initial nodes
        if (this.treeNodesService.getTreeNodes(this.mode) != null) {
            // if (this.browseEntityService.selectedEntity$.)
            // this.initDataDone$.next(true);

          this.retrieveEntitiesToExpand().pipe(
            takeUntil(this.unsubscribeSubject$),
            filter(entities => entities.length > 0),
            map(entities => this.entitiesLoadedInTree(entities, this.tree.treeModel) ? entities : []),
            concatMap(entities => combineLatest(of(entities), entities.length > 0 ?
              this.expandEntitiesToExpand(entities) :
              this.loadEntitiesToExpand(entities)
            )),
            tap(([entities, any]) =>
              this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entities[entities.length - 1].dmEntity.uid))
            ),
            tap(() => {
              if (this.initial === true) {
                this.initial = false;
                this.scrollToFocusedNode();
                }
            })
          ).subscribe();
        } else {
          this.browseEntityService.selectedEntity$.pipe(
            takeUntil(this.unsubscribeSubject$),
            filter(selected => selected != null && selected !== undefined),
            concatMap(() => this.retrieveEntitiesToExpand()),
            filter(entities => entities.length > 0),
            concatMap(entities => combineLatest(of(entities), this.loadEntitiesToExpand(entities))),
            tap(([entities]) =>
              this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entities[entities.length - 1].dmEntity.uid))
            ),
            tap(() => {
              if (this.initial === true) {
                this.initial = false;
                this.scrollToFocusedNode();
              }
            })
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

    /*this.initDataDone$
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
*/
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
        map(workspaceWrapper => workspaceWrapper.dmEntity),
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

}
