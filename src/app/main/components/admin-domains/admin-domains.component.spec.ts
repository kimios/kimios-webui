import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDomainsComponent } from './admin-domains.component';

describe('AdminDomainsComponent', () => {
  let component: AdminDomainsComponent;
  let fixture: ComponentFixture<AdminDomainsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDomainsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDomainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
