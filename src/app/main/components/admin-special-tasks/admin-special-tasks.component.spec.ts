import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecialTasksComponent } from './admin-special-tasks.component';

describe('AdminSpecialTasksComponent', () => {
  let component: AdminSpecialTasksComponent;
  let fixture: ComponentFixture<AdminSpecialTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSpecialTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSpecialTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
