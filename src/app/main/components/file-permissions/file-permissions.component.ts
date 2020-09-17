import {Component, Input, OnInit} from '@angular/core';
import {DMEntitySecurity, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'file-permissions',
  templateUrl: './file-permissions.component.html',
  styleUrls: ['./file-permissions.component.scss']
})
export class FilePermissionsComponent implements OnInit {

  @Input()
  documentId: number;

  permissions: Array<DMEntitySecurity>;
  constructor(
      private securityService: SecurityService,
      private sessionService: SessionService,
  ) {
    this.permissions = new Array<DMEntitySecurity>();
  }

  ngOnInit(): void {
    this.securityService.getDMEntitySecurities(this.sessionService.sessionToken, this.documentId).subscribe(
        securities => this.permissions = securities
    );
  }

}
