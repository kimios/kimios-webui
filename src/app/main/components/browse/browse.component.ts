import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService, EXPLORER_MODE} from 'app/services/browse-entity.service';
import {BehaviorSubject, combineLatest, from, iif, Observable, of} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {ActivatedRoute} from '@angular/router';
import {catchError, concatMap, filter, flatMap, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {TreeNodesService} from 'app/services/tree-nodes.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {MatDialog, PageEvent} from '@angular/material';
import {FilesUploadDialogComponent} from '../files-upload-dialog/files-upload-dialog.component';
import {Tag} from 'app/main/model/tag';
import {FileUploadService} from 'app/services/file-upload.service';
import {EntityMoveDialogComponent} from 'app/main/components/entity-move-dialog/entity-move-dialog.component';

interface EntityNode {
  uid: number;
  label: string;
  children?: EntityNode[];
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
    pageSizeOptions = [10, 20, 50];

    length: number;

    explorerMode: EXPLORER_MODE.BROWSE | EXPLORER_MODE.SEARCH;

    historyHasBack = false;
    historyHasForward = false;

    constructor(
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      private route: ActivatedRoute,
      private treeNodesService: TreeNodesService,
      private fileUploadService: FileUploadService,
      public filesUploadDialog: MatDialog
  ) {

    this.entitiesToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.initDataDone$ = new BehaviorSubject(false);
    this.nodeUidsToExpand = new Array<number>();
    this.entitiesLoaded = new Map<number, DMEntity>();
    this.explorerMode = EXPLORER_MODE.BROWSE;
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

      this.browseEntityService.totalEntitiesToDisplay$.subscribe(
          next => this.length = next.length
      );

      this.browseEntityService.length.subscribe(
          next => this.length = next
      );

      this.pageSize = this.browseEntityService.pageSize;

      this.browseEntityService.pageIndex.subscribe(
          next => this.pageIndex = next
      );

      this.browseEntityService.explorerMode.subscribe(
          next => {
              this.explorerMode = next;
              if (this.explorerMode === EXPLORER_MODE.BROWSE) {
                  this.browseEntityService.selectedEntity$.next(this.browseEntityService.selectedEntity$.getValue());
              }
          }
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
              tap(entity => this.tree.treeModel.setFocusedNode(this.tree.treeModel.getNodeById(entity.uid))),
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

    paginatorHandler($event: PageEvent): void {
        this.browseEntityService.makePage($event.pageIndex, $event.pageSize);
    }

    searchModeOn(): void {
        this.browseEntityService.explorerMode.next(EXPLORER_MODE.SEARCH);
    }

    searchModeOff(): void {
        this.browseEntityService.explorerMode.next(EXPLORER_MODE.BROWSE);
    }

    handleDrop(event: Event): void {
        event.preventDefault();

        if (event['dataTransfer']
            && event['dataTransfer'].getData('text/plain') !== null
            && event['dataTransfer'].getData('text/plain') !== undefined
            && event['dataTransfer'].getData('text/plain').startsWith('kimiosEntityMove')
            && event['droppedInDir'] !== null
            && event['droppedInDir'] !== undefined) {

            const data = event['dataTransfer'].getData('text/plain');
            const dataSplitted = data.split(':');
            if (dataSplitted.length !== 2
                || Number(dataSplitted[1]) === NaN) {
                return;
            }
            console.log(dataSplitted.join(' : '));
            this.openEntityMoveConfirmDialog(
                this.browseEntityService.entities.get(Number(dataSplitted[1])),
                event['droppedInDir']
            );
            return;
        }

        if (event['dataTransfer'] != null
            && event['dataTransfer']['files'] != null) {
            Array.from(event['dataTransfer']['files']).forEach(file => console.log(file));
            this.openFilesUploadDialog(event['dataTransfer']['files'], event['droppedInDir'] ? event['droppedInDir'] : '');
        }
    }

    handleDragOver(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
    }

    openFilesUploadDialog(list: FileList, droppedInDir?: DMEntity): void {
        const dialogRef = this.filesUploadDialog.open(FilesUploadDialogComponent, {
            // width: '250px',
            data: {
                filesList: Array.from(list),
                filesTags: new Map<string, Map<number, Tag>>()
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (! result) {
                return;
            }
            console.log('The dialog was closed');
            console.dir(dialogRef.componentInstance.data.filesList);

            const currentPath = this.browseEntityService.currentPath.getValue();
            let path: string;
            let currentDir: DMEntity;
            if (currentPath.length > 0) {
                path = '/' + currentPath.map(elem => elem.name).join('/');
                currentDir = currentPath[currentPath.length - 1];
            } else {
                return;
            }

            let parentDir: DMEntity;
            if (droppedInDir !== null && droppedInDir !== undefined) {
                path += '/' + droppedInDir.name;
                parentDir = droppedInDir;
            } else {
                parentDir = currentDir;
            }

            this.fileUploadService.uploadFiles(dialogRef.componentInstance.data.filesList.map(v => [
                v,
                path + '/' + v.name,
                true,
                '[]',
                true,
                -1,
                '[]',
                dialogRef.componentInstance.data.filesTags.get(v.name) ?
                    Array.from(dialogRef.componentInstance.data.filesTags.get(v.name).keys()) :
                    []
            ]))
                .pipe(
                    catchError(error => {
                        console.log('server error: ');
                        console.dir(error);
                        return of({ name: 'filename', status: 'error', message: (error.error && error.error.message) ? error.error.message : '' });
                    })
                )
                .subscribe(
                    null,
                    null,
                    () => {
                        this.browseEntityService.deleteCacheEntry(parentDir.uid);
                        this.browseEntityService.selectedEntity$.next(currentDir);
                    }
                );
        });
    }

    onFocus($event): void {
        this.browseEntityService.selectedEntityFromGridOrTree$.next(this.entitiesLoaded.get(Number($event.node.data.id)));
    }

    private openEntityMoveConfirmDialog(entityMoved: DMEntity, entityTarget: DMEntity): void {
        const dialogRef = this.filesUploadDialog.open(EntityMoveDialogComponent, {
            // width: '250px',
            data: {
                entityMoved: entityMoved,
                entityTarget: entityTarget
            }
        });

        dialogRef.afterClosed().subscribe(next => {
            if (next !== true) {
                return;
            }
            this.browseEntityService.moveEntity(entityMoved, entityTarget).subscribe(
                null,
                // TODO : catch error and show message
                null,
                () => {
                    console.log(
                        'moved entity '
                        + entityMoved.name
                        + ' to '
                        + entityTarget.name
                    );
                    if (DMEntityUtils.dmEntityIsFolder(entityMoved)) {
                        this.updateMoveTreeNode(entityMoved, entityTarget);
                    }
                    this.browseEntityService.updateListAfterMove(entityMoved, entityTarget);
                }
            );
        });
    }

    private updateMoveTreeNode(entityMoved: DMEntity, entityTarget: DMEntity): void {
        this.tree.treeModel.moveNode(
            this.tree.treeModel.getNodeById(entityMoved.uid),
            // {
            //    parent:
                    this.tree.treeModel.getNodeById(entityTarget.uid)
            // }
        );
    }
}
