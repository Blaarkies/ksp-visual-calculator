import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntennaStatsComponent } from './antenna-stats.component';

describe('AntennaStatsComponent', () => {
  let component: AntennaStatsComponent;
  let fixture: ComponentFixture<AntennaStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AntennaStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AntennaStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
