import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioDocumentTypesComponent } from './studio-document-types.component';

describe('StudioDocumentTypesComponent', () => {
  let component: StudioDocumentTypesComponent;
  let fixture: ComponentFixture<StudioDocumentTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudioDocumentTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudioDocumentTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
