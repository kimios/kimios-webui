import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseTreeBaseComponent } from './browse-tree-base.component';

describe('BrowseTreeBaseComponent', () => {
  let component: BrowseTreeBaseComponent;
  let fixture: ComponentFixture<BrowseTreeBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseTreeBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseTreeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
