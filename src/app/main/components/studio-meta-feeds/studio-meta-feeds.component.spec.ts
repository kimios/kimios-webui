import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioMetaFeedsComponent } from './studio-meta-feeds.component';

describe('StudioMetaFeedsComponent', () => {
  let component: StudioMetaFeedsComponent;
  let fixture: ComponentFixture<StudioMetaFeedsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudioMetaFeedsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudioMetaFeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
