import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedDocumentsComponent } from './related-documents.component';

describe('RelatedDocumentsComponent', () => {
  let component: RelatedDocumentsComponent;
  let fixture: ComponentFixture<RelatedDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatedDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
