import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecialTasksDefaultTaskComponent } from './admin-special-tasks-default-task.component';

describe('AdminSpecialTasksDefaultTaskComponent', () => {
  let component: AdminSpecialTasksDefaultTaskComponent;
  let fixture: ComponentFixture<AdminSpecialTasksDefaultTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSpecialTasksDefaultTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSpecialTasksDefaultTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
