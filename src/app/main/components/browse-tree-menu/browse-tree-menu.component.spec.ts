import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseTreeMenuComponent } from './browse-tree-menu.component';

describe('BrowseTreeMenuComponent', () => {
  let component: BrowseTreeMenuComponent;
  let fixture: ComponentFixture<BrowseTreeMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseTreeMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseTreeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
