import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentRefreshService {

  needRefresh: BehaviorSubject<number>;

  constructor() {
    this.needRefresh = new BehaviorSubject<number>(undefined);
  }
}
