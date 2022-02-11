import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DMEntity, Document as KimiosDocument} from 'app/kimios-client-api';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {concatMap, filter, map, takeWhile, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {combineLatest, of, Subject} from 'rxjs';

@Component({
  selector: 'browse-path',
  templateUrl: './browse-path.component.html',
  styleUrls: ['./browse-path.component.scss']
})
export class BrowsePathComponent implements OnInit, OnDestroy {

  pathDirs: Array<DMEntity>;
  subscriptionOk = true;

  @Input()
  document: KimiosDocument;
  entityUpdated$: Subject<number>;

  constructor(
      private browseEntityService: BrowseEntityService,
      private entityCacheService: EntityCacheService,
      public router: Router
  ) {
    this.pathDirs = [];
    this.entityUpdated$ = new Subject<number>();
  }

  ngOnInit(): void {
    if (this.contextIsWorkspace()) {
      this.browseEntityService.currentPath.pipe(
          takeWhile(next => this.subscriptionOk)
      ).subscribe(
          next => this.pathDirs = next
      );
    } else {
      if (this.document !== null && this.contextIsDocument()) {
        this.entityCacheService.findAllParents(this.document.folderUid, true).subscribe(
            next => this.pathDirs = next.reverse()
        );
      }
    }
    
    this.entityCacheService.workspaceUpdated$.pipe(
      map(workspaceId => this.entityUpdated$.next(workspaceId))
    ).subscribe();

    this.entityCacheService.folderUpdated$.pipe(
      tap(folderId => this.entityUpdated$.next(folderId))
    ).subscribe();

    this.entityCacheService.documentUpdate$.pipe(
      tap(documentId => this.entityUpdated$.next(documentId))
    ).subscribe();
    
    this.entityUpdated$.pipe(
      map(entityId => this.pathDirs.findIndex(entity => entity.uid === entityId)),
      filter(entityIdx => entityIdx !== -1),
      concatMap(entityIdx => combineLatest(of(entityIdx), this.entityCacheService.findEntityInCache(this.pathDirs[entityIdx].uid))),
      tap(([entityIdx, entity]) => this.pathDirs[entityIdx] = entity)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptionOk = false;
  }

  goToHome(): void {
      this.browseEntityService.selectedEntityFromGridOrTree$.next(undefined);
      this.browseEntityService.currentPath.next([]);
  }

  goToDir(dir: DMEntity): void {
    this.browseEntityService.selectedEntityFromGridOrTree$.next(dir);
    const index = this.browseEntityService.currentPath.getValue().findIndex(dirPath => dirPath.uid === dir.uid);
    if (index !== -1) {
      this.browseEntityService.currentPath.next(this.browseEntityService.currentPath.getValue().slice(0, index + 1));
    }
  }

  navigateToDir(entityContainerUid: number): void {
    DocumentUtils.navigateToFolderOrWorkspace(this.router, entityContainerUid);
  }

  contextIsWorkspace(): boolean {
    const regExp = new RegExp('^/workspaces($|/)');
    return regExp.test(this.router.url);
  }

  contextIsDocument(): boolean {
    return this.router.url.includes('/document/');
  }
}
