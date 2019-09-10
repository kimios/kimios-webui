import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAndGroupsSelectionPanelComponent } from './users-and-groups-selection-panel.component';

describe('UsersAndGroupsSelectionPanelComponent', () => {
  let component: UsersAndGroupsSelectionPanelComponent;
  let fixture: ComponentFixture<UsersAndGroupsSelectionPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersAndGroupsSelectionPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersAndGroupsSelectionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
