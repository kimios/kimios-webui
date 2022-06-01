import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BROWSE_TREE_MODE} from '../../model/browse-tree-mode.enum';
import {MatDialog} from '@angular/material';
import {concatMap, filter, takeUntil, tap} from 'rxjs/operators';
import {TreeNodesService} from '../../../services/tree-nodes.service';
import {BrowseEntityService} from '../../../services/browse-entity.service';
import {ActivatedRoute} from '@angular/router';
import {EntityCreationService} from '../../../services/entity-creation.service';
import {IconService} from '../../../services/icon.service';
import {EntityCacheService} from '../../../services/entity-cache.service';
import {DocumentDetailService} from '../../../services/document-detail.service';
import {SessionService} from '../../../services/session.service';
import {BrowseTreeBaseComponent} from '../browse-tree-base/browse-tree-base.component';
import {combineLatest, of} from 'rxjs';

@Component({
  selector: 'browse-tree-simple',
  templateUrl: './browse-tree-simple.component.html',
  styleUrls: ['./browse-tree-simple.component.scss']
})
export class BrowseTreeSimpleComponent extends BrowseTreeBaseComponent implements OnInit, AfterViewInit {

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
  }

  ngOnInit(): void {
    super.ngOnInit();

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
  }

  ngAfterViewInit(): void {
    if (this.treeNodesService.getTreeNodes(this.mode) != null) {
      // if mode is BROWSE_TREE_MODE.CHOOSE_PARENT
      // expand parent node
      if (this.mode === BROWSE_TREE_MODE.CHOOSE_PARENT) {

        this.entityCacheService.findAllParentWrappers(this.entityId).pipe(
          takeUntil(this.unsubscribeSubject$),
          concatMap(entities => combineLatest(of(entities), this.loadEntitiesToExpand(entities))),
          tap(([entities]) => console.dir(entities)),
          tap(() => console.dir(this.tree.treeModel)),
          tap(([entities]) =>
            this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entities[0].dmEntity.uid))
          ),
          tap(() => {
            if (this.initial === true) {
              this.initial = false;
              this.scrollToFocusedNode();
            }
          })
        ).subscribe();
      }
    } else {
      if (this.entityId != null) {
        this.entityCacheService.findAllParentWrappers(this.entityId).pipe(
          takeUntil(this.unsubscribeSubject$),
          concatMap(entities => combineLatest(of(entities), this.loadEntitiesToExpand(entities))),
          tap(([entities]) => console.dir(entities)),
          tap(() => console.dir(this.tree.treeModel)),
          tap(([entities]) =>
            this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entities[0].dmEntity.uid))
          ),
          tap(() => {
            if (this.initial === true) {
              this.initial = false;
              this.scrollToFocusedNode();
            }
          })
        ).subscribe();
      } else {
        this.entityCacheService.findEntityChildrenInCache(null, true).pipe(
          takeUntil(this.unsubscribeSubject$),
          tap(workspaces => workspaces.forEach(workspaceWrapper => {
            const newNode = this.createNodeFromEntity(workspaceWrapper.dmEntity);
            if (this.tree.treeModel.getNodeById(newNode.id) == null) {
              this.addNode(newNode, this.nodes);
              this.cdRef.detectChanges();
              this.tree.treeModel.update();
              this.cdRef.detectChanges();
            }
          })),
          concatMap(workspaces => this.entityCacheService.askFoldersInFolders(workspaces.map(w => w.dmEntity.uid)))
        ).subscribe();
      }
    }
  }
}
