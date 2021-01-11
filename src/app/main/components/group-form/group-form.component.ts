import {Component, Input, OnInit} from '@angular/core';
import {AdministrationService, Group, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {AdminService} from 'app/services/admin.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss']
})
export class GroupFormComponent implements OnInit {

  @Input()
  group: Group;
  @Input()
  source: string;

  groupForm: FormGroup;
  showSpinnerFormSubmit = false;

  constructor(
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private adminService: AdminService,
      private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    this.groupForm = this._createFormGroup(this.group);
  }

  _createFormGroup(group: Group): FormGroup {
    const formGroup = this.fb.group({
//          'uid': this.fb.control(),
      'name': this.fb.control(group ? group.name : '')
    });
    if (group == null || group === undefined) {
      formGroup.addControl('gid', this.fb.control('', {
        validators: [
          Validators.pattern(/^[a-zA-Z0-9_-]+$/),
          Validators.minLength(4)
        ]
      }));
    }

    return formGroup;
  }

  onSubmit(): void {
    if (this.groupForm.invalid) {
      return;
    }
    this.showSpinnerFormSubmit = true;
    if (this.group) {
      this.administrationService.updateGroup(
          this.sessionService.sessionToken,
          this.group.gid,
          this.groupForm.get('name').value,
          this.group.source
      ).subscribe(
          () => {
            this.showSpinnerFormSubmit = false;
            // this.adminService.closeUserDialog$.next(true);
          },
      );
    } else {
      this.administrationService.createGroup(
          this.sessionService.sessionToken,
          this.groupForm.get('gid').value,
          this.groupForm.get('name').value,
          this.source
      ).subscribe(
          () => {
            this.showSpinnerFormSubmit = false;
            // this.adminService.closeUserDialog$.next(true);
          }
      );
    }
  }

  close(): void {
    this.adminService.closeUserDialog$.next(true);
  }
}
