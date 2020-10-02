import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareExternalComponent } from './share-external.component';

describe('ShareExternalComponent', () => {
  let component: ShareExternalComponent;
  let fixture: ComponentFixture<ShareExternalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareExternalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
