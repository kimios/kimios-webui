import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AdministrationService, SecurityService, User as KimiosUser} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {ValidationErrors} from '@angular/forms/src/directives/validators';

const userFormPasswordConfirmValidator = function(control: FormGroup): ValidationErrors | null {
  return (control.get('password').value === control.get('passwordConfirm').value) ?
      null :
      {
        'passwordConfirm' : 'password and confirmation are not equals'
      };
};

@Component({
  selector: 'user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  @Input()
  user: KimiosUser;

  userForm: FormGroup;

  constructor(
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    this.userForm = this._createFormGroupFromUser(this.user);
  }
  
  _createFormGroupFromUser(user: KimiosUser): FormGroup {
    return this.fb.group({
          'uid': this.fb.control(user.uid),
          // name?: string;
          'firstName': this.fb.control(user.firstName),
          'lastName': this.fb.control(user.lastName),
          'phoneNumber': this.fb.control(user.phoneNumber),
          'mail': this.fb.control(user.mail),
          'password': this.fb.control(''),
          'passwordConfirm': this.fb.control(''),
          'enabled': this.fb.control(user.enabled)
        },
        [ userFormPasswordConfirmValidator ]
    );
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
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
        () => console.log('user updated')
    );
  }
}
