import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AdministrationService, AuthenticationSource, AuthenticationSourceParam, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {concatMap, filter, tap} from 'rxjs/operators';

@Component({
  selector: 'admin-domains',
  templateUrl: './admin-domains.component.html',
  styleUrls: ['./admin-domains.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDomainsComponent implements OnInit {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomainName = '';
  authenticationSource$: BehaviorSubject<AuthenticationSource>;
  authenticationSourceParams$: BehaviorSubject<Map<string, string>>;
  authenticationSourceLoaded$: Subject<boolean>;
  formGroupCreated$: Subject<boolean>;
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
    this.authenticationSource$ = new BehaviorSubject(null);
    this.authenticationSourceLoaded$ = new Subject<boolean>();
    this.authenticationSourceParams$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());
    this.formGroupCreated$ = new Subject<boolean>();
  }

  ngOnInit(): void {
    this.authenticationSourceLoaded$.pipe(
        filter(loaded => loaded != null && loaded !== undefined)
    ).subscribe(
        authSource => {
          this.initForm(this.authenticationSource$.getValue());
          this.selectedDomainName = this.authenticationSource$.getValue().name;
          this.formGroupCreated$.next(true);
        }
    );
  }

  private initForm(authSource: AuthenticationSource): void {
      const paramsControl = this.fb.group({});
      this.authenticationSourceParams$.getValue().forEach((value, key) => {
          paramsControl.addControl(key, this.fb.control(value));
      });

    this.formGroup = this.fb.group({
      name: this.fb.control(authSource.name),
      className: this.fb.control(authSource.className),
      enableSso: this.fb.control(authSource.enableSso),
      enableMailCheck: this.fb.control(authSource.enableMailCheck),
      params: paramsControl
    });
  }

  public getParamsControlAsMap(): Map<string, string> {
      const mapControls = new Map<string, string>();
      Object.keys((this.formGroup.get('params') as FormGroup).controls).forEach(key => {
          mapControls.set(key, this.formGroup.get('params')[key]);
      });
      return mapControls;
  }

  public getParamsControlAsObject(): { [key: string]: string } {
      const obj = {};
      Object.keys((this.formGroup.get('params') as FormGroup).controls).forEach(key => {
          obj[key] = (this.formGroup.get('params') as FormGroup).get(key).value;
      });
      return obj;
  }

      loadDomain(domain: string): void {
    this.administrationService.getAuthenticationSource(this.sessionService.sessionToken, domain).pipe(
        tap(authSource => this.authenticationSource$.next(authSource)),
        tap(authSource => console.dir(authSource)),
        concatMap(authSource => this.administrationService.getAuthenticationSourceParams(
            this.sessionService.sessionToken,
            authSource.name,
            authSource.className
        )),
        tap(authSourceParams => {
            const params = new Map<string, string>();
            Object.keys(authSourceParams).forEach(key => params.set(key, authSourceParams[key]));
            this.authenticationSourceParams$.next(params);
        })
    ).subscribe(
        params => this.authenticationSourceLoaded$.next(true),
        null,
        null
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
            'parameters': this.getParamsControlAsObject()
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
