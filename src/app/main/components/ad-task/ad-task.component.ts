import {Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AdDirective} from '../../file-manager/ad-directive';
import {AdminService} from '../../../services/admin.service';
import {filter} from 'rxjs/operators';
import {AdminSpecialTasksSessionsComponent} from '../admin-special-tasks-sessions/admin-special-tasks-sessions.component';
import {AdminSpecialTasksReindexComponent} from '../admin-special-tasks-reindex/admin-special-tasks-reindex.component';

@Component({
  selector: 'ad-task',
  templateUrl: './ad-task.component.html',
  styleUrls: ['./ad-task.component.scss']
})
export class AdTaskComponent implements OnInit, OnDestroy {
  @ViewChild(AdDirective) AdDirectiveSelector: AdDirective;

  components = {
    1: AdminSpecialTasksSessionsComponent,
    2: AdminSpecialTasksReindexComponent
  };

  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.adminService.selectedTask$.pipe(
        filter(taskId => taskId !== 0)
    ).subscribe(
        taskId => this.loadComponent(taskId)
    );
  }

  ngOnDestroy(): void {
  }

  loadComponent(taskId: number): void {

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.components[taskId]);

    const viewContainerRef = this.AdDirectiveSelector.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
  }
}
