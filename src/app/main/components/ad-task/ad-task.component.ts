import {Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AdDirective} from 'app/main/file-manager/ad-directive';
import {AdminService} from 'app/services/admin.service';
import {AdminSpecialTasksSessionsComponent} from 'app/main/components/admin-special-tasks-sessions/admin-special-tasks-sessions.component';
import {AdminSpecialTasksReindexComponent} from 'app/main/components/admin-special-tasks-reindex/admin-special-tasks-reindex.component';
import {AdminSpecialTasksDefaultTaskComponent} from 'app/main/components/admin-special-tasks-default-task/admin-special-tasks-default-task.component';

@Component({
  selector: 'ad-task',
  templateUrl: './ad-task.component.html',
  styleUrls: ['./ad-task.component.scss']
})
export class AdTaskComponent implements OnInit, OnDestroy {
  @ViewChild(AdDirective) AdDirectiveSelector: AdDirective;

  components = {
    0: AdminSpecialTasksDefaultTaskComponent,
    1: AdminSpecialTasksSessionsComponent,
    2: AdminSpecialTasksReindexComponent
  };

  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.adminService.selectedTask$.pipe(
        // filter(taskId => taskId !== 0)
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
