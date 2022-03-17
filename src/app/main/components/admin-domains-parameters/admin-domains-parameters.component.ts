import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {AdministrationService, AuthenticationSource, AuthenticationSourceParam} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {concatMap, filter, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DomainEditionType} from '../../model/domain-edition-type.enum';
import {MatSelectChange} from '@angular/material';

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
  formGroupCreated = false;
  formGroup: FormGroup;
  availableTypes$: Observable<Array<string>>;
  actionType: DomainEditionType;
  paramsMap: Map<string, string>;
  selectedDomainObj: AuthenticationSource;
  selectedDomainParams: { [key: string]: string; };
  currentDomainParams: { [key: string]: string; };
  currentDomainParamsKeys: Array<string>;

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
    this.formGroup = this.fb.group({
      name: {value: '', disabled: !this.actionTypeIsCreation()},
      className: '',
      enableSso: false,
      enableMailCheck: false,
      params: this.fb.group({})
    });
    this.paramsMap = new Map<string, string>();
  }

  ngOnInit(): void {
    if (this.adminService.newDomain$.getValue() === true) {
      this.handleNewDomainEventTrue();
    }

    this.adminService.newDomain$.pipe(
      filter(bool => bool === true),
      tap(() => this.handleNewDomainEventTrue())
    ).subscribe();

    this.adminService.selectedDomain$.pipe(
        filter(domainName => domainName !== ''),
        tap(() => this.actionType = DomainEditionType.UPDATE),
        concatMap(
        domainName => this.administrationService.getAuthenticationSource(this.sessionService.sessionToken, domainName)
        ),
        tap(authSource => this.authenticationSource$.next(authSource)),
        tap(authSource => this.selectedDomainObj = authSource),
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
          this.selectedDomainParams = authSourceParams;
          this.currentDomainParams = authSourceParams;
          this.currentDomainParamsKeys = this.extractObjectKeys(authSourceParams);
        }),
        tap(([authSource, authSourceParams]) => this.initForm(authSource, authSourceParams))
    ).subscribe(
        ([authSource, authSourceParams]) => this.formGroupCreated = true
    );
  }

  private extractObjectKeys(obj: { [key: string]: string; }): Array<string> {
    return Object.keys(obj).map(key => key);
  }

  public handleClassNameSelection(event: MatSelectChange): void {
    const className = event.value;
    this.currentDomainParams = null;
    this.currentDomainParamsKeys = null;
    if (this.selectedDomainObj != null && className === this.selectedDomainObj.className) {
      this.initFormGroup(this.formGroup.get('params') as FormGroup, this.selectedDomainParams);
    }
    (className === '' ?
      of([]) :
      this.administrationService.getAvailableAuthenticationSourceParams(
        this.sessionService.sessionToken,
        className
      )
    ).pipe(
      tap(params => {
        if (className !== ''
          || (this.selectedDomainObj != null && className !== this.selectedDomainObj.className)) {
          const obj = {};
          params.forEach(param => obj[param] = '');
          this.initFormGroup(this.formGroup.get('params') as FormGroup, obj);
          this.currentDomainParams = obj;
          this.currentDomainParamsKeys = this.extractObjectKeys(obj);
        }
      })
    ).subscribe();
  }

  private handleNewDomainEventTrue(): void {
    this.actionType = DomainEditionType.CREATION;
    this.initForm(null, null);
    this.formGroupCreated = true;
    this.formGroup.get('name').enable();
  }

  private initForm(authSource: AuthenticationSource, authSourceParams: { [key: string]: string; }): void {
    this.formGroup.setControl('params', this.fb.group({}));
    this.initFormGroup(this.formGroup.get('params') as FormGroup, authSourceParams);

    this.formGroup.get('name').setValue(authSource ? authSource.name : '');
    this.formGroup.get('className').setValue(authSource ? authSource.className : '');
    this.formGroup.get('enableSso').setValue(authSource ? authSource.enableSso : false);
    this.formGroup.get('enableMailCheck').setValue(authSource ? authSource.enableMailCheck : false);
  }

  private initFormGroup(formGroup: FormGroup, obj: { [key: string]: string; }): void {
    if (obj != null) {
      Object.keys(obj).forEach((key) => {
        formGroup.addControl(key, this.fb.control(obj[key]));
      });
    }
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
    if (this.formGroup.dirty) {
      if (this.adminService.newDomain$.getValue() === true) {
        this.administrationService.createAuthenticationSourceFromObj(
          <AuthenticationSourceParam>{
            'sessionId': this.sessionService.sessionToken,
            'name': this.formGroup.get('name').value,
            'className': this.formGroup.get('className').value,
            'enableSso': this.formGroup.get('enableSso').value,
            'enableMailCheck': this.formGroup.get('enableMailCheck').value,
            'parameters': this.getParamsControlAsObject()
          }
        ).subscribe(
          next => {
            this.adminService.newDomainCreated$.next(true);
            this.adminService.selectedDomain$.next(this.formGroup.get('name').value);
          },
          error => null
        );
      } else {
        this.administrationService.updateAuthenticationSource_2(
          <AuthenticationSourceParam>{
            'sessionId': this.sessionService.sessionToken,
            'name': this.formGroup.get('name').value,
            'className': this.formGroup.get('className').value,
            'enableSso': this.formGroup.get('enableSso').value,
            'enableMailCheck': this.formGroup.get('enableMailCheck').value,
            'parameters': this.getParamsControlAsObject()
          }
        ).subscribe(
          null,
          error => this.adminService.selectedDomain$.next(this.formGroup.get('name').value)
        );
      }
    }
  }

  cancel(): void {
    this.adminService.selectedDomain$.next(this.formGroup.get('name').value);
  }

  actionTypeIsCreation(): boolean {
    return this.actionType === DomainEditionType.CREATION;
  }
}
