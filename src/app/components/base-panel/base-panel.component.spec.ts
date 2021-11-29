import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePanelComponent } from './base-panel.component';

describe('BasePanelComponent', () => {
  let component: BasePanelComponent;
  let fixture: ComponentFixture<BasePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasePanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
