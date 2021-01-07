import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDomainsGroupsComponent } from './admin-domains-groups.component';

describe('AdminDomainsGroupsComponent', () => {
  let component: AdminDomainsGroupsComponent;
  let fixture: ComponentFixture<AdminDomainsGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDomainsGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDomainsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
