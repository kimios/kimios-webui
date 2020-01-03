import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KimiosNavBarComponent } from './kimios-nav-bar.component';

describe('KimiosNavBarComponent', () => {
  let component: KimiosNavBarComponent;
  let fixture: ComponentFixture<KimiosNavBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KimiosNavBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KimiosNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
