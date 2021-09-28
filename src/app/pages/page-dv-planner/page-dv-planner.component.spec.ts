import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDvPlannerComponent } from './page-dv-planner.component';

describe('PageDvPlannerComponent', () => {
  let component: PageDvPlannerComponent;
  let fixture: ComponentFixture<PageDvPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageDvPlannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageDvPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
