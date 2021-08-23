import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {AdministrationService, User as KimiosUser} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {concatMap, tap} from 'rxjs/operators';
import {iif, Observable} from 'rxjs';

const PATTERN_EMAIL = new RegExp('^\\w+@\\w{2,}\\.\\w{2,}$');

export const passwordConfirmValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const pass1 = (control as FormGroup).get('password');
  const pass2 = (control as FormGroup).get('confirmPassword');

  console.log(pass1.value + ' ==? ' + pass2.value);
  const res = pass1 && pass2 && pass1.value === pass2.value;
  (control as FormGroup).get('confirmPassword').setErrors(
      res ?
          null :
          {'passwordNotConfirmed': true}
  );

  return res ? null : {'passwordNotConfirmed': true};
};

@Component({
  selector: 'personal-settings',
  templateUrl: './personal-settings.component.html',
  styleUrls: ['./personal-settings.component.scss']
})
export class PersonalSettingsComponent implements OnInit {

  formGroup: FormGroup;
  private currentUser: KimiosUser;

  constructor(
      private fb: FormBuilder,
      private administrationService: AdministrationService,
      private sessionService: SessionService
  ) {
    this.formGroup = this.fb.group({
      'firstname': this.fb.control('', [Validators.required]),
      'lastname': this.fb.control('', [Validators.required]),
      'phoneNumber': this.fb.control('', [Validators.required]),
      'password': this.fb.control('', [Validators.minLength(8)]),
      'confirmPassword': this.fb.control(''),
      'mail': this.fb.control('', [Validators.required, Validators.pattern(PATTERN_EMAIL)])
    }, { validators: passwordConfirmValidator });
  }

  ngOnInit(): void {
    this.initCurrentUserAndFormGroup(this.formGroup, false).subscribe();
  }

  submit(): void {
    if (this.formGroup.valid) {
      this.administrationService.updateUser(
          this.sessionService.sessionToken,
          this.currentUser.uid,
          this.formGroup.get('firstname').value,
          this.formGroup.get('lastname').value,
          this.formGroup.get('phoneNumber').value,
          this.formGroup.get('mail').value,
          this.formGroup.get('password').value,
          this.currentUser.source
      ).pipe(
          concatMap(() => this.initCurrentUserAndFormGroup(this.formGroup, true))
      ).subscribe();
    }
  }

  cancel(): void {
    this.initCurrentUserAndFormGroup(this.formGroup, false).subscribe();
  }

  private initCurrentUserAndFormGroup(formGroup: FormGroup, reload: boolean): Observable<KimiosUser> {
    return iif(
        () => reload === true,
        this.sessionService.retrieveUserData(),
        this.sessionService.getCurrentUserObs()
    ).pipe(
        tap(user => this.currentUser = user),
        tap(user => this.initFormGroupFromCurrentUser(this.formGroup, user))
    );
  }

  private initFormGroupFromCurrentUser(formGroup: FormGroup, user: KimiosUser): void {
    this.formGroup.get('firstname').setValue(user.firstName);
    this.formGroup.get('lastname').setValue(user.lastName);
    this.formGroup.get('phoneNumber').setValue(user.phoneNumber);
    this.formGroup.get('mail').setValue(user.mail);
  }
}
