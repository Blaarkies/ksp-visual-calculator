import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardMarkerComponent } from './wizard-marker.component';

describe('WizardMarkerComponent', () => {
  let component: WizardMarkerComponent;
  let fixture: ComponentFixture<WizardMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WizardMarkerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
