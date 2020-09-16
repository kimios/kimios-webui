import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityListLockButtonComponent } from './entity-list-lock-button.component';

describe('EntityListLockButtonComponent', () => {
  let component: EntityListLockButtonComponent;
  let fixture: ComponentFixture<EntityListLockButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityListLockButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityListLockButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
