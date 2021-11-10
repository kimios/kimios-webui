import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentVersionDataComponent } from './document-version-data.component';

describe('DocumentVersionDataComponent', () => {
  let component: DocumentVersionDataComponent;
  let fixture: ComponentFixture<DocumentVersionDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentVersionDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentVersionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
