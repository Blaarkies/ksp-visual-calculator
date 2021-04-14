import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSelectComponent } from './input-select.component';

describe('SelectComponent', () => {
  let component: InputSelectComponent;
  let fixture: ComponentFixture<InputSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
