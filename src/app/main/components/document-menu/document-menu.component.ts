import {Component, Input, OnInit} from '@angular/core';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {Router} from '@angular/router';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {Document as KimiosDocument} from 'app/kimios-client-api';

@Component({
  selector: 'document-menu',
  templateUrl: './document-menu.component.html',
  styleUrls: ['./document-menu.component.scss']
})
export class DocumentMenuComponent implements OnInit {

  @Input()
  entity: KimiosDocument;

  constructor(
      private router: Router,
      private bes: BrowseEntityService
  ) { }

  ngOnInit(): void {
  }

  navigateToFolder(): void {
    this.goToDocument(this.entity.folderUid, 'folder');
  }

  navigateToDocument(): void {
    this.goToDocument(this.entity.uid, 'document');
  }

  goToDocument(entityId: number, entityType: 'folder' | 'document'): void {
    if (entityType === 'folder') {
      this.bes.selectedEntityFromGridOrTree$.next(this.bes.entities.get(entityId));
      this.bes.findAllParents(entityId, true).subscribe(
          next => this.bes.currentPath.next(next.reverse())
      );
      DocumentUtils.navigateToFolderOrWorkspace(this.router, entityId);
    } else {
      DocumentUtils.navigateToFile(this.router, entityId);
    }
    this.bes.openEntityFromFileUploadList$.next(entityId);
  }
}
