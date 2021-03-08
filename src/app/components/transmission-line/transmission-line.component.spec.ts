import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransmissionLineComponent } from './transmission-line.component';

describe('TransmissionLineComponent', () => {
  let component: TransmissionLineComponent;
  let fixture: ComponentFixture<TransmissionLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransmissionLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransmissionLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
