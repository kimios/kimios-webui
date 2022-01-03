import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseTreeChooseLocationComponent } from './browse-tree-choose-location.component';

describe('BrowseTreeChooseLocationComponent', () => {
  let component: BrowseTreeChooseLocationComponent;
  let fixture: ComponentFixture<BrowseTreeChooseLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseTreeChooseLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseTreeChooseLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
