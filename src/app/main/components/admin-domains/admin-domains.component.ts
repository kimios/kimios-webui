import {Component, OnInit} from '@angular/core';
import {AdministrationService, AuthenticationSource, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Observable} from 'rxjs';
import {AdminService} from 'app/services/admin.service';

@Component({
  selector: 'admin-domains',
  templateUrl: './admin-domains.component.html',
  styleUrls: ['./admin-domains.component.scss'],
})
export class AdminDomainsComponent implements OnInit {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomainName = '';

  constructor(
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private adminService: AdminService,
  ) {
    this.domains$ = this.adminService.domains$;
  }

  ngOnInit(): void {
  }

  selectDomain(name: string): void {
    this.adminService.selectedDomain$.next(name);
  }

    removeDomain(name: string) {
        
    }
}
