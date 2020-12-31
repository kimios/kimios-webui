import { Component, OnInit } from '@angular/core';
import {AdministrationService, AuthenticationSource, AuthenticationSourceParam, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Observable, Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'admin-domains',
  templateUrl: './admin-domains.component.html',
  styleUrls: ['./admin-domains.component.scss']
})
export class AdminDomainsComponent implements OnInit {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomainName = '';
  authenticationSource$: Subject<AuthenticationSource>;
  availableTypes$: Observable<Array<string>>;

  formGroup: FormGroup;

  constructor(
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private fb: FormBuilder
  ) {
    this.domains$ = this.securityService.getAuthenticationSources();
    this.availableTypes$ = this.administrationService.getAvailableAuthenticationSources(this.sessionService.sessionToken);
    this.authenticationSource$ = new Subject();
  }

  ngOnInit(): void {
    this.authenticationSource$.subscribe(
        authSource => {
          this.initForm(authSource);
          this.selectedDomainName = authSource.name;
        }
    );
  }

  private initForm(authSource: AuthenticationSource): void {
    this.formGroup = this.fb.group({
      name: this.fb.control(authSource.name),
      className: this.fb.control(authSource.className),
      enableSso: this.fb.control(authSource.enableSso),
      enableMailCheck: this.fb.control(authSource.enableMailCheck)
    });
  }

  loadDomain(domain: string): void {
    this.administrationService.getAuthenticationSource(this.sessionService.sessionToken, domain).subscribe(
        authSource => this.authenticationSource$.next(authSource)
    );
  }

  onSubmit(): void {
    console.log('dirty ?' + this.formGroup.dirty);
    if (this.formGroup.dirty) {
      this.administrationService.updateAuthenticationSource_2(
          <AuthenticationSourceParam> {
            'sessionId': this.sessionService.sessionToken,
            'name': this.formGroup.get('name').value,
            'className': this.formGroup.get('className').value,
            'enableSso': this.formGroup.get('enableSso').value,
            'enableMailCheck': this.formGroup.get('enableMailCheck').value,
            'parameters': {
              'className': this.formGroup.get('className').value
            }
          }
      ).subscribe(
          null,
          error => this.loadDomain(this.selectedDomainName),
          () => console.log('authentication source saved: ' + this.selectedDomainName)
      );
    }
  }

  cancel(): void {
    this.loadDomain(this.selectedDomainName);
  }
}
