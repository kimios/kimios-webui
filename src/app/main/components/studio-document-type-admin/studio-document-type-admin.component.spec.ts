import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioDocumentTypeAdminComponent } from './studio-document-type-admin.component';

describe('StudioDocumentTypeAdminComponent', () => {
  let component: StudioDocumentTypeAdminComponent;
  let fixture: ComponentFixture<StudioDocumentTypeAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudioDocumentTypeAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudioDocumentTypeAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
