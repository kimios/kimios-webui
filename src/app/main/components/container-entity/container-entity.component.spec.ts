import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerEntityComponent } from './container-entity.component';

describe('ContainerEntityComponent', () => {
  let component: ContainerEntityComponent;
  let fixture: ComponentFixture<ContainerEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
