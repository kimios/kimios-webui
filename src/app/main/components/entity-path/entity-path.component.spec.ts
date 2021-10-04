import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityPathComponent } from './entity-path.component';

describe('EntityPathComponent', () => {
  let component: EntityPathComponent;
  let fixture: ComponentFixture<EntityPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityPathComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
