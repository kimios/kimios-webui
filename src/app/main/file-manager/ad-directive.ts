import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[AdDirectiveSelector]'
})
export class AdDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
