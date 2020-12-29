import { Component, OnInit } from '@angular/core';
import {AdministrationService, AuthenticationSource, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Observable, Subject} from 'rxjs';

@Component({
  selector: 'admin-domains',
  templateUrl: './admin-domains.component.html',
  styleUrls: ['./admin-domains.component.scss']
})
export class AdminDomainsComponent implements OnInit {

  domains$: Observable<Array<AuthenticationSource>>;
  authenticationSource$: Subject<AuthenticationSource>;
  availableTypes$: Observable<Array<string>>;

  constructor(
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      private securityService: SecurityService
  ) {
    this.domains$ = this.securityService.getAuthenticationSources();
    this.availableTypes$ = this.administrationService.getAvailableAuthenticationSources(this.sessionService.sessionToken);
    this.authenticationSource$ = new Subject();
  }

  ngOnInit(): void {
  }

  loadDomain(domain: string): void {
    this.administrationService.getAuthenticationSource(this.sessionService.sessionToken, domain).subscribe(
        authSource => this.authenticationSource$.next(authSource)
    );
  }


}
