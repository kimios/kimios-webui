import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {AdministrationService, AuthenticationSource, AuthenticationSourceParam} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {concatMap, filter, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'admin-domains-parameters',
  templateUrl: './admin-domains-parameters.component.html',
  styleUrls: ['./admin-domains-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDomainsParametersComponent implements OnInit {

  authenticationSource$: BehaviorSubject<AuthenticationSource>;
  authenticationSourceParams$: BehaviorSubject<Map<string, string>>;
  formGroupCreated$: Subject<boolean>;
  formGroup: FormGroup;
  availableTypes$: Observable<Array<string>>;

  constructor(
      private adminService: AdminService,
      private administrationService: AdministrationService,
      private sessionService: SessionService,
      private fb: FormBuilder
  ) {
    this.authenticationSource$ = new BehaviorSubject<AuthenticationSource>(null);
    this.authenticationSourceParams$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());
    this.availableTypes$ = this.administrationService.getAvailableAuthenticationSources(this.sessionService.sessionToken);
    this.formGroupCreated$ = new Subject<boolean>();
  }

  ngOnInit(): void {
    this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== ''),
        concatMap(
        domainName => this.administrationService.getAuthenticationSource(this.sessionService.sessionToken, domainName)
        ),
        tap(authSource => this.authenticationSource$.next(authSource)),
        tap(authSource => console.dir(authSource)),
        concatMap(authSource => combineLatest(of(authSource), this.administrationService.getAuthenticationSourceParams(
            this.sessionService.sessionToken,
            authSource.name,
            authSource.className
        ))),
        tap(([authSource, authSourceParams]) => {
          const params = new Map<string, string>();
          Object.keys(authSourceParams).forEach(key => params.set(key, authSourceParams[key]));
          this.authenticationSourceParams$.next(params);
        }),
        tap(([authSource, authSourceParams]) => this.initForm(authSource, authSourceParams))
    ).subscribe(
        ([authSource, authSourceParams]) => this.formGroupCreated$.next(true)
    );
  }

  private initForm(authSource: AuthenticationSource, authSourceParams: { [key: string]: string; }): void {
    const paramsControl = this.fb.group({});
    Object.keys(authSourceParams).forEach((key) => {
      paramsControl.addControl(key, this.fb.control(authSourceParams[key]));
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
          error => this.adminService.selectedDomain$.next(this.formGroup.get('name').value),
          () => console.log('authentication source saved: ' + this.formGroup.get('name').value)
      );
    }
  }

  cancel(): void {
    this.adminService.selectedDomain$.next(this.formGroup.get('name').value);
  }
}