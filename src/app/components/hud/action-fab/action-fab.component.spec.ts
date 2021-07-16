import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionFabComponent } from './action-fab.component';

describe('ActionFabComponent', () => {
  let component: ActionFabComponent;
  let fixture: ComponentFixture<ActionFabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionFabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
