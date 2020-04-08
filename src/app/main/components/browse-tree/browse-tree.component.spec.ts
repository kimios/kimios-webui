import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseTreeComponent } from './browse-tree.component';

describe('BrowseTreeComponent', () => {
  let component: BrowseTreeComponent;
  let fixture: ComponentFixture<BrowseTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
