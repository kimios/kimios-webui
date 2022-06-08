import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentSharesComponent } from './document-shares.component';

describe('DocumentSharesComponent', () => {
  let component: DocumentSharesComponent;
  let fixture: ComponentFixture<DocumentSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentSharesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
