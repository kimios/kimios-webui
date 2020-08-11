import { Injectable } from '@angular/core';
import {ListingType} from 'app/main/model/listing-type.enum';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceSessionService {
  private _gridOrList: ListingType = ListingType.GRID;

  constructor() {
  }

  get gridOrList(): ListingType {
    return this._gridOrList;
  }

  set gridOrList(value: ListingType) {
    this._gridOrList = value;
  }
}
