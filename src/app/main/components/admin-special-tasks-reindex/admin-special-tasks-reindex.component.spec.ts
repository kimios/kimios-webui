import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecialTasksReindexComponent } from './admin-special-tasks-reindex.component';

describe('AdminSpecialTasksReindexComponent', () => {
  let component: AdminSpecialTasksReindexComponent;
  let fixture: ComponentFixture<AdminSpecialTasksReindexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSpecialTasksReindexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSpecialTasksReindexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
