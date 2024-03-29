import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn} from '@angular/forms';
import {AdministrationService, Group, SecurityService, User as KimiosUser} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {ValidationErrors} from '@angular/forms/src/directives/validators';
import {AdminService} from 'app/services/admin.service';

const userFormPasswordConfirmValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null =>  {
    let errors = null;
  if (control.get('password').value !== control.get('passwordConfirm').value) {
      errors = {
          'passwordConfirm' : 'password and confirmation are not equals'
      };
      control.get('passwordConfirm').setErrors(errors);
      control.get('passwordConfirm').markAsTouched();
  } else {
      control.get('passwordConfirm').setErrors(null);
  }
  return errors;
};

@Component({
  selector: 'user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  @Input()
  user: KimiosUser;
  @Input()
  source: string;
  @Input()
  edit: boolean;

  userForm: FormGroup;
  enabledSlideToggleMessage: string;
    showSpinnerFormSubmit = false;
    userGroups: Array<Group>;

  constructor(
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private adminService: AdminService,
      private fb: FormBuilder
  ) {
      this.userGroups = new Array<Group>();
  }

  ngOnInit(): void {
    this.userForm = this._createFormGroup(this.user);
    this._updateEnabledSlideToggleMessage(this.userForm.get('enabled').value);
    this.userForm.get('enabled').valueChanges.subscribe(
        value => this._updateEnabledSlideToggleMessage(value)
    );
  }

  _updateErrorsOnFormFields(): void {
      if (this.userForm.getError('passwordConfirm')) {
          this.userForm.get('passwordConfirm').setErrors({
              'passwordConfirm': this.userForm.getError('passwordConfirm')
          });
      }
  }

  _updateEnabledSlideToggleMessage(enabled: any): void {
      this.enabledSlideToggleMessage = enabled ?
          'Enabled' :
          'Disabled';
  }
  
  _createFormGroup(user: KimiosUser): FormGroup {
    const formGroup = this.fb.group({
//          'uid': this.fb.control(),
          'firstName': this.fb.control(user ? user.firstName : ''),
          'lastName': this.fb.control(user ? user.lastName : ''),
          'phoneNumber': this.fb.control(user ? user.phoneNumber : ''),
          'mail': this.fb.control(user ? user.mail : ''),
          'password': this.fb.control(''),
          'passwordConfirm': this.fb.control(''),
          'enabled': this.fb.control(user ? user.enabled : '')
        }, {
        validators: userFormPasswordConfirmValidator
    });
    if (user == null || user === undefined) {
        formGroup.addControl('uid', this.fb.control(''));
    }

    return formGroup;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
    this.showSpinnerFormSubmit = true;
    if (this.user) {
        this.administrationService.updateUser(
            this.sessionService.sessionToken,
            this.user.uid,
            this.userForm.get('firstName').value,
            this.userForm.get('lastName').value,
            this.userForm.get('phoneNumber').value,
            this.userForm.get('mail').value,
            this.userForm.get('password').value,
            this.user.source,
            this.userForm.get('enabled').value
        ).subscribe(
            () => {
                this.showSpinnerFormSubmit = false;
                // this.adminService.closeUserDialog$.next(true);
            },
        );
    } else {
        this.administrationService.createUser(
            this.sessionService.sessionToken,
            this.userForm.get('uid').value,
            this.userForm.get('firstName').value,
            this.userForm.get('lastName').value,
            this.userForm.get('phoneNumber').value,
            this.userForm.get('mail').value,
            this.userForm.get('password').value,
            this.source,
            this.userForm.get('enabled').value
        ).subscribe(
            () => {
                this.showSpinnerFormSubmit = false;
                // this.adminService.closeUserDialog$.next(true);
                this.adminService.newUserCreated$.next(true);
            }
        );
    }
  }

    close(): void {
        this.adminService.closeUserDialog$.next(true);
    }
}
