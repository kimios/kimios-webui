import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePermissionsComponent } from './file-permissions.component';

describe('FilePermissionsComponent', () => {
  let component: FilePermissionsComponent;
  let fixture: ComponentFixture<FilePermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilePermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
