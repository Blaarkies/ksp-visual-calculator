import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntennaSelectorComponent } from './antenna-selector.component';

describe('AntennaSelectorComponent', () => {
  let component: AntennaSelectorComponent;
  let fixture: ComponentFixture<AntennaSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AntennaSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AntennaSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
