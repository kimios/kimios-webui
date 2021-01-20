import { Component, OnInit } from '@angular/core';
import {AdminService} from 'app/services/admin.service';

@Component({
  selector: 'admin-special-tasks',
  templateUrl: './admin-special-tasks.component.html',
  styleUrls: ['./admin-special-tasks.component.scss']
})
export class AdminSpecialTasksComponent implements OnInit {

  private _possibleTasks: Map<number, string> = new Map<number, string>([
    [1, 'Sessions management'],
    [2, 'Reindex']
  ]);
  public possibleTasksId: Array<number>;

  constructor(
      private adminService: AdminService,
  ) {
    this.possibleTasksId = Array.from(this._possibleTasks.keys());
  }

  ngOnInit(): void {
    this.adminService.selectedTask$.subscribe(

    );
  }

  selectTask(possibleTaskId: number): void {
    this.adminService.selectedTask$.next(possibleTaskId);
  }
}
