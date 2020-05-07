import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLinkComponent } from './document-link.component';

describe('DocumentLinkComponent', () => {
  let component: DocumentLinkComponent;
  let fixture: ComponentFixture<DocumentLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
