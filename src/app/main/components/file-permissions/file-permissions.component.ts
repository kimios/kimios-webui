import {Component, Input, OnInit} from '@angular/core';
import {DMEntitySecurity, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {WorkspaceSessionService} from 'app/services/workspace-session.service';

@Component({
  selector: 'file-permissions',
  templateUrl: './file-permissions.component.html',
  styleUrls: ['./file-permissions.component.scss']
})
export class FilePermissionsComponent implements OnInit {

  @Input()
  documentId: number;

  permissions: Array<DMEntitySecurity>;
  entityName: string;

  constructor(
      private securityService: SecurityService,
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      private workspaceSessionService: WorkspaceSessionService
  ) {
    this.permissions = new Array<DMEntitySecurity>();
    this.entityName = '';
  }

  ngOnInit(): void {
    this.securityService.getDMEntitySecurities(this.sessionService.sessionToken, this.documentId).subscribe(
        securities => this.permissions = securities
    );

    this.browseEntityService.getEntity(this.documentId).subscribe(
        entity => this.entityName = entity.name
    );
  }

  cancel($event: MouseEvent): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.workspaceSessionService.closePermissionsDialog.next(true);
  }
}
