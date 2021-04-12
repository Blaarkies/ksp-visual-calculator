import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextAreaComponent } from './input-text-area.component';

describe('InputTextAreaComponent', () => {
  let component: InputTextAreaComponent;
  let fixture: ComponentFixture<InputTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputTextAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
