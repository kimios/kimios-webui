import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AuthenticationSource, SecurityService} from 'app/kimios-client-api';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomain$: BehaviorSubject<string>;

  constructor(
      private securityService: SecurityService
  ) {
    this.domains$ = this.securityService.getAuthenticationSources();
    this.selectedDomain$ = new BehaviorSubject<string>('');
  }
}
