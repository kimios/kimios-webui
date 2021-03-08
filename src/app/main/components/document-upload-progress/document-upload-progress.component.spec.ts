import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentUploadProgressComponent } from './document-upload-progress.component';

describe('DocumentUploadProgressComponent', () => {
  let component: DocumentUploadProgressComponent;
  let fixture: ComponentFixture<DocumentUploadProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentUploadProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentUploadProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
