import {Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {NotificationService} from 'app/services/notification.service';
import {DocumentUploadProgressComponent} from 'app/main/components/document-upload-progress/document-upload-progress.component';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'notification-center-list',
  templateUrl: './notification-center-list.component.html',
  styleUrls: ['./notification-center-list.component.scss']
})
export class NotificationCenterListComponent implements OnInit {

  private rootViewContainer: any;
  @ViewChild('dynamic', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef;

  constructor(
      private factoryResolver: ComponentFactoryResolver,
      private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.notificationService.uploadCreated.pipe(
        filter(id => id !== ''),
    ).subscribe(
        id => this.addDynamicComponent(id)
    );
  }

  public setRootViewContainerRef(viewContainerRef): void {
    this.rootViewContainer = viewContainerRef;
  }

  public addDynamicComponent(uploadId: string): void {
    const factory = this.factoryResolver.resolveComponentFactory(DocumentUploadProgressComponent);
    const component = factory.create(this.viewContainerRef.injector);
    component.instance.uploadId = uploadId;
    this.viewContainerRef.insert(component.hostView);
  }

}
