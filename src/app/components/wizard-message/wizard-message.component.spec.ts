import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardMessageComponent } from './wizard-message.component';

describe('WizardMessageComponent', () => {
  let component: WizardMessageComponent;
  let fixture: ComponentFixture<WizardMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WizardMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
