import { Component, OnInit } from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {User} from 'app/kimios-client-api';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  currentUser: User;
  isAdmin$: Observable<boolean>;
  hasStudioAccess$: Observable<boolean>;

  constructor(
      private sessionService: SessionService
  ) {
    this.currentUser = this.sessionService.currentUser;
    this.isAdmin$ = this.sessionService.currentUserIsAdmin();
    this.hasStudioAccess$ = this.sessionService.currentUserHasStudioAccess();
  }

  ngOnInit(): void {
  }

}
