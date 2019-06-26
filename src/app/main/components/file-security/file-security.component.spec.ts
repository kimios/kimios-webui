import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSecurityComponent } from './file-security.component';

describe('FileSecurityComponent', () => {
  let component: FileSecurityComponent;
  let fixture: ComponentFixture<FileSecurityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileSecurityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
