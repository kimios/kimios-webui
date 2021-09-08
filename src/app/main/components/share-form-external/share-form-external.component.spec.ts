import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareFormExternalComponent } from './share-form-external.component';

describe('ShareFormExternalComponent', () => {
  let component: ShareFormExternalComponent;
  let fixture: ComponentFixture<ShareFormExternalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareFormExternalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareFormExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
