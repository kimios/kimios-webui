import { Injectable } from '@angular/core';
import {ListingType} from 'app/main/model/listing-type.enum';
import {BehaviorSubject} from 'rxjs';
import {DMEntitySort} from 'app/main/model/dmentity-sort';

export const DEFAULT_DMENTITY_SORT = <DMEntitySort>{name: 'name', direction: 'asc'};

@Injectable({
  providedIn: 'root'
})
export class WorkspaceSessionService {
  private _gridOrList: ListingType = ListingType.LIST;
  public sort: BehaviorSubject<DMEntitySort> = new BehaviorSubject<DMEntitySort>(DEFAULT_DMENTITY_SORT);
  public closePermissionsDialog: BehaviorSubject<boolean>;
  public closeUserPermissionAdd: BehaviorSubject<boolean>;

  constructor() {
    this.closePermissionsDialog = new BehaviorSubject<boolean>(null);
    this.closeUserPermissionAdd = new BehaviorSubject<boolean>(false);
  }

  get gridOrList(): ListingType {
    return this._gridOrList;
  }

  set gridOrList(value: ListingType) {
    this._gridOrList = value;
  }
}
