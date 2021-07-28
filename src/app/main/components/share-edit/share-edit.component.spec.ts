import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareEditComponent } from './share-edit.component';

describe('ShareEditComponent', () => {
  let component: ShareEditComponent;
  let fixture: ComponentFixture<ShareEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
