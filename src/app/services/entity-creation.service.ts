import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {UserOrGroup} from '../main/components/users-and-groups-selection-panel/users-and-groups-selection-panel.component';

@Injectable({
  providedIn: 'root'
})
export class EntityCreationService {

  public newUserOrGroupTmp$: Subject<UserOrGroup>;
  public removedUserOrGroupTmp$: Subject<UserOrGroup>;
  public onFormSubmitted$: Subject<boolean>;

  constructor() {
    this.newUserOrGroupTmp$ = new Subject<UserOrGroup>();
    this.removedUserOrGroupTmp$ = new Subject<UserOrGroup>();
  }


}
