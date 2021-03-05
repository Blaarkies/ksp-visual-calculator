import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDistanceCheckComponent } from './page-distance-check.component';

describe('PageDistanceCheckComponent', () => {
  let component: PageDistanceCheckComponent;
  let fixture: ComponentFixture<PageDistanceCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageDistanceCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageDistanceCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
