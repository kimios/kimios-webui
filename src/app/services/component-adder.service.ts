import {ComponentFactoryResolver, Injectable, ViewChild, ViewContainerRef} from '@angular/core';
import {Component} from '@angular/core/src/metadata/directives';
import {FileUploadProgressComponent} from '../main/components/file-upload-progress/file-upload-progress.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentAdderService {

  @ViewChild('dynamic', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef;

  constructor(private factoryResolver: ComponentFactoryResolver) { }

  public addDynamicComponent(): void {
    const factory = this.factoryResolver.resolveComponentFactory(FileUploadProgressComponent);
    const component = factory.create(this.viewContainerRef.injector);
    // component.instance.
    this.viewContainerRef.insert(component.hostView);
  }

}

