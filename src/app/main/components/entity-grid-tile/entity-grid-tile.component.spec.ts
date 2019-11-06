import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityGridTileComponent } from './entity-grid-tile.component';

describe('EntityGridTileComponent', () => {
  let component: EntityGridTileComponent;
  let fixture: ComponentFixture<EntityGridTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityGridTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityGridTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
