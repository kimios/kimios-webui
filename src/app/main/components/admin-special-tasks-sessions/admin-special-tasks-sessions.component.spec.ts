import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecialTasksSessionsComponent } from './admin-special-tasks-sessions.component';

describe('AdminSpecialTasksSessionsComponent', () => {
  let component: AdminSpecialTasksSessionsComponent;
  let fixture: ComponentFixture<AdminSpecialTasksSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSpecialTasksSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSpecialTasksSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
