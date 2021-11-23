import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentVersionDataDialogComponent } from './document-version-data-dialog.component';

describe('DocumentVersionDataDialogComponent', () => {
  let component: DocumentVersionDataDialogComponent;
  let fixture: ComponentFixture<DocumentVersionDataDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentVersionDataDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentVersionDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
