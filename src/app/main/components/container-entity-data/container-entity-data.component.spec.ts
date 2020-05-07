import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerEntityDataComponent } from './container-entity-data.component';

describe('ContainerEntityDataComponent', () => {
  let component: ContainerEntityDataComponent;
  let fixture: ComponentFixture<ContainerEntityDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerEntityDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerEntityDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
