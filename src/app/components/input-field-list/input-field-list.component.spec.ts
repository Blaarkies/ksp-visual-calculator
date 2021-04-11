import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFieldListComponent } from './input-field-list.component';

describe('InputFieldListComponent', () => {
  let component: InputFieldListComponent;
  let fixture: ComponentFixture<InputFieldListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputFieldListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFieldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
