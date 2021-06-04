import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoiCircleComponent } from './soi-circle.component';

describe('SoiCircleComponent', () => {
  let component: SoiCircleComponent;
  let fixture: ComponentFixture<SoiCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoiCircleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoiCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
