import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareEditDialogComponent } from './share-edit-dialog.component';

describe('ShareEditDialogComponent', () => {
  let component: ShareEditDialogComponent;
  let fixture: ComponentFixture<ShareEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
