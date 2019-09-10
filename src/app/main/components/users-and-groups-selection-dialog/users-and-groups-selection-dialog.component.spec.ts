import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAndGroupsSelectionDialogComponent } from './users-and-groups-selection-dialog.component';

describe('UsersAndGroupsSelectionDialogComponent', () => {
  let component: UsersAndGroupsSelectionDialogComponent;
  let fixture: ComponentFixture<UsersAndGroupsSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersAndGroupsSelectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersAndGroupsSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
