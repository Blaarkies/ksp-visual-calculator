import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionJourneyComponent } from './mission-journey.component';

describe('MissionJourneyComponent', () => {
  let component: MissionJourneyComponent;
  let fixture: ComponentFixture<MissionJourneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionJourneyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionJourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
