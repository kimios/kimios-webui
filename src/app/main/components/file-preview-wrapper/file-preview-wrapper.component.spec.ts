import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePreviewWrapperComponent } from './file-preview-wrapper.component';

describe('FilePreviewWrapperComponent', () => {
  let component: FilePreviewWrapperComponent;
  let fixture: ComponentFixture<FilePreviewWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilePreviewWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePreviewWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
