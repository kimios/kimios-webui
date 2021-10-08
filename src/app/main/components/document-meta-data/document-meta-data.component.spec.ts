import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentMetaDataComponent } from './document-meta-data.component';

describe('DocumentMetaDataComponent', () => {
  let component: DocumentMetaDataComponent;
  let fixture: ComponentFixture<DocumentMetaDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentMetaDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentMetaDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
