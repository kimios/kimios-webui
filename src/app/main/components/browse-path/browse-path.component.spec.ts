import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowsePathComponent } from './browse-path.component';

describe('BrowsePathComponent', () => {
  let component: BrowsePathComponent;
  let fixture: ComponentFixture<BrowsePathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowsePathComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowsePathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
