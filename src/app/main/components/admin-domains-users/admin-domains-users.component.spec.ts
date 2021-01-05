import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDomainsUsersComponent } from './admin-domains-users.component';

describe('AdminDomainsUsersComponent', () => {
  let component: AdminDomainsUsersComponent;
  let fixture: ComponentFixture<AdminDomainsUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDomainsUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDomainsUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
