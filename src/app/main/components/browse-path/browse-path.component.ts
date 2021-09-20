import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DMEntity, Document as KimiosDocument} from 'app/kimios-client-api';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {takeWhile} from 'rxjs/operators';
import {Router} from '@angular/router';
import {DocumentUtils} from '../../utils/document-utils';

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

  constructor(
      private browseEntityService: BrowseEntityService,
      private router: Router
  ) {
    this.pathDirs = [];
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
        this.browseEntityService.findAllParents(this.document.folderUid, true).subscribe(
            next => this.pathDirs = next.reverse()
        );
      }
    }
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
    return this.router.url.includes('/workspaces/');
  }

  contextIsDocument(): boolean {
    return this.router.url.includes('/document/');
  }
}
