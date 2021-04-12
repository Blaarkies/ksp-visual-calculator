import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppInfoActionPanelComponent } from './app-info-action-panel.component';

describe('AppInfoActionPanelComponent', () => {
  let component: AppInfoActionPanelComponent;
  let fixture: ComponentFixture<AppInfoActionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppInfoActionPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppInfoActionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
