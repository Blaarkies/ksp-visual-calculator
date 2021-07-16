import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBottomSheetComponent } from './action-bottom-sheet.component';

describe('ActionBottomSheetComponent', () => {
  let component: ActionBottomSheetComponent;
  let fixture: ComponentFixture<ActionBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionBottomSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
