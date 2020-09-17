import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePermissionsDialogComponent } from './file-permissions-dialog.component';

describe('FilePermissionsDialogComponent', () => {
  let component: FilePermissionsDialogComponent;
  let fixture: ComponentFixture<FilePermissionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilePermissionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePermissionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
