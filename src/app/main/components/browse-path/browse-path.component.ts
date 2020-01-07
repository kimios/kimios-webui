import {Component, OnDestroy, OnInit} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {takeWhile} from 'rxjs/operators';

@Component({
  selector: 'browse-path',
  templateUrl: './browse-path.component.html',
  styleUrls: ['./browse-path.component.scss']
})
export class BrowsePathComponent implements OnInit, OnDestroy {

  pathDirs: Array<DMEntity>;
  subscriptionOk = true;

  constructor(private browseEntityService: BrowseEntityService) {
    this.pathDirs = [];
  }

  ngOnInit(): void {
    this.browseEntityService.currentPath.pipe(
        takeWhile(next => this.subscriptionOk)
    ).subscribe(
        next => this.pathDirs = next
    );
  }

  ngOnDestroy(): void {
    this.subscriptionOk = false;
  }

  goToHome(): void {
      this.browseEntityService.selectedEntity$.next(undefined);
      this.browseEntityService.currentPath.next([]);
  }

  goToDir(dir: DMEntity): void {
    this.browseEntityService.selectedEntity$.next(dir);
    const index = this.browseEntityService.currentPath.getValue().findIndex(dirPath => dirPath.uid === dir.uid);
    if (index !== -1) {
      this.browseEntityService.currentPath.next(this.browseEntityService.currentPath.getValue().slice(0, index + 1));
    }
  }
}
