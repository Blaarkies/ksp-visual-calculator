import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateEditNameRowComponent } from './state-edit-name-row.component';

describe('StateEditNameRowComponent', () => {
  let component: StateEditNameRowComponent;
  let fixture: ComponentFixture<StateEditNameRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StateEditNameRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StateEditNameRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
