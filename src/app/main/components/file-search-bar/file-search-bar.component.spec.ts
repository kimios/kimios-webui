import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSearchBarComponent } from './file-search-bar.component';

describe('FileSearchBarComponent', () => {
  let component: FileSearchBarComponent;
  let fixture: ComponentFixture<FileSearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileSearchBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
