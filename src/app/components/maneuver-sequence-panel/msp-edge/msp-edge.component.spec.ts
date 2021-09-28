import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MspEdgeComponent } from './msp-edge.component';

describe('MspEdgeComponent', () => {
  let component: MspEdgeComponent;
  let fixture: ComponentFixture<MspEdgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MspEdgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MspEdgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
