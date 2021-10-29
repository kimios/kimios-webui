import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailTagsComponent } from './file-detail-tags.component';

describe('FileDetailTagsComponent', () => {
  let component: FileDetailTagsComponent;
  let fixture: ComponentFixture<FileDetailTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDetailTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDetailTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
