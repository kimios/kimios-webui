import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecialRolesComponent } from './admin-special-roles.component';

describe('AdminSpecialRolesComponent', () => {
  let component: AdminSpecialRolesComponent;
  let fixture: ComponentFixture<AdminSpecialRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSpecialRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSpecialRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
