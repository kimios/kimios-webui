import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioMetaFeedAdminComponent } from './studio-meta-feed-admin.component';

describe('StudioMetaFeedAdminComponent', () => {
  let component: StudioMetaFeedAdminComponent;
  let fixture: ComponentFixture<StudioMetaFeedAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudioMetaFeedAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudioMetaFeedAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
