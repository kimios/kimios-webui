import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDomainsParametersComponent } from './admin-domains-parameters.component';

describe('AdminDomainsParametersComponent', () => {
  let component: AdminDomainsParametersComponent;
  let fixture: ComponentFixture<AdminDomainsParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDomainsParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDomainsParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
