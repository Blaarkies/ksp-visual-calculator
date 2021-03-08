import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrbitLineComponent } from './orbit-line.component';

describe('OrbitLineComponent', () => {
  let component: OrbitLineComponent;
  let fixture: ComponentFixture<OrbitLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrbitLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrbitLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
