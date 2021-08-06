import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseTreeDialogComponent } from './browse-tree-dialog.component';

describe('BrowseTreeDialogComponent', () => {
  let component: BrowseTreeDialogComponent;
  let fixture: ComponentFixture<BrowseTreeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseTreeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseTreeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
