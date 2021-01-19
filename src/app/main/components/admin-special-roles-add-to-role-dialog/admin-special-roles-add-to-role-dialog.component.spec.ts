import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecialRolesAddToRoleDialogComponent } from './admin-special-roles-add-to-role-dialog.component';

describe('AdminSpecialRolesAddToRoleDialogComponent', () => {
  let component: AdminSpecialRolesAddToRoleDialogComponent;
  let fixture: ComponentFixture<AdminSpecialRolesAddToRoleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSpecialRolesAddToRoleDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSpecialRolesAddToRoleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
