import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CelestialBodyDetailsDialogComponent } from './celestial-body-details-dialog.component';

describe('CelestialBodyDetailsDialogComponent', () => {
  let component: CelestialBodyDetailsDialogComponent;
  let fixture: ComponentFixture<CelestialBodyDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CelestialBodyDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CelestialBodyDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
