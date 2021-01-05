import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {AdministrationService, AuthenticationSource, SecurityService} from 'app/kimios-client-api';
import {SessionService} from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomain$: Subject<string>;

  constructor(
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      private securityService: SecurityService
  ) {
    this.domains$ = this.securityService.getAuthenticationSources();
    this.selectedDomain$ = new Subject<string>();
  }
}
