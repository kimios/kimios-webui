import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseTreeSimpleComponent } from './browse-tree-simple.component';

describe('BrowseTreeSimpleComponent', () => {
  let component: BrowseTreeSimpleComponent;
  let fixture: ComponentFixture<BrowseTreeSimpleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseTreeSimpleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseTreeSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
