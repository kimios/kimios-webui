import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginCenterComponent } from './plugin-center.component';

describe('PluginCenterComponent', () => {
  let component: PluginCenterComponent;
  let fixture: ComponentFixture<PluginCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PluginCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
