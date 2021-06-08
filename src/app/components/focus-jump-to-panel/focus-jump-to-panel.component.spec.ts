import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusJumpToPanelComponent } from './focus-jump-to-panel.component';

describe('FocusJumpToPanelComponent', () => {
  let component: FocusJumpToPanelComponent;
  let fixture: ComponentFixture<FocusJumpToPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FocusJumpToPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FocusJumpToPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
