import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTagsComponent } from './file-tags.component';

describe('FileTagsComponent', () => {
  let component: FileTagsComponent;
  let fixture: ComponentFixture<FileTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
