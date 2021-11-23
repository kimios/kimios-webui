import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailDataAndTagsComponent } from './file-detail-data-and-tags.component';

describe('FileDetailDataAndTagsComponent', () => {
  let component: FileDetailDataAndTagsComponent;
  let fixture: ComponentFixture<FileDetailDataAndTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDetailDataAndTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDetailDataAndTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
