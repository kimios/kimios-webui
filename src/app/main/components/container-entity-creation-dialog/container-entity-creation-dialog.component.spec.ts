import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerEntityCreationDialogComponent } from './container-entity-creation-dialog.component';

describe('ContainerEntityCreationDialogComponent', () => {
  let component: ContainerEntityCreationDialogComponent;
  let fixture: ComponentFixture<ContainerEntityCreationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerEntityCreationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerEntityCreationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
