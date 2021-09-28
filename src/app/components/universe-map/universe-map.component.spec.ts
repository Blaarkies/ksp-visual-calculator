import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniverseMapComponent } from './universe-map.component';

describe('UniverseMapComponent', () => {
  let component: UniverseMapComponent;
  let fixture: ComponentFixture<UniverseMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UniverseMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UniverseMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
