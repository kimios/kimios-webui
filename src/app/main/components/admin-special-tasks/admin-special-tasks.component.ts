import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
  @ViewChild('divider',  { read: ElementRef }) divider: ElementRef;

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

  ngAfterViewChecked(): void {
    const previousSiblingHeight = this.divider.nativeElement.previousSibling.clientHeight;
    const nextSiblingHeight = this.divider.nativeElement.nextSibling.clientHeight;
    const dividerHeight = Math.max(previousSiblingHeight, nextSiblingHeight);
    this.divider.nativeElement.style.height = dividerHeight + 'px';
  }
}
