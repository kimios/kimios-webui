import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesListComponent } from './shares-list.component';

describe('SharesListComponent', () => {
  let component: SharesListComponent;
  let fixture: ComponentFixture<SharesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
