import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerEntityDialogComponent } from './container-entity-dialog.component';

describe('ContainerEntityDialogComponent', () => {
  let component: ContainerEntityDialogComponent;
  let fixture: ComponentFixture<ContainerEntityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerEntityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerEntityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
