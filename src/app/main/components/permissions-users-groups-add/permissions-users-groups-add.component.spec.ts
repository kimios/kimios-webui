import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsUsersGroupsAddComponent } from './permissions-users-groups-add.component';

describe('PermissionsUsersGroupsAddComponent', () => {
  let component: PermissionsUsersGroupsAddComponent;
  let fixture: ComponentFixture<PermissionsUsersGroupsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermissionsUsersGroupsAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionsUsersGroupsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
