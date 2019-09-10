import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersGroupsSearchPanelComponent } from './users-groups-search-panel.component';

describe('UsersGroupsSearchPanelComponent', () => {
  let component: UsersGroupsSearchPanelComponent;
  let fixture: ComponentFixture<UsersGroupsSearchPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersGroupsSearchPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersGroupsSearchPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
