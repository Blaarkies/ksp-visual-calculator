import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativePositionCameraTestComponent } from './relative-position-camera-test.component';

describe('RelativePositionCameraTestComponent', () => {
  let component: RelativePositionCameraTestComponent;
  let fixture: ComponentFixture<RelativePositionCameraTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelativePositionCameraTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelativePositionCameraTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
