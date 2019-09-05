import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailDataComponent } from './file-detail-data.component';

describe('FileDetailDataComponent', () => {
  let component: FileDetailDataComponent;
  let fixture: ComponentFixture<FileDetailDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDetailDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDetailDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
