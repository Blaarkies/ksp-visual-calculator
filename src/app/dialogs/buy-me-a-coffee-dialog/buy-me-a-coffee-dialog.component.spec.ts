import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyMeACoffeeDialogComponent } from './buy-me-a-coffee-dialog.component';

describe('BuyMeACoffeeDialogComponent', () => {
  let component: BuyMeACoffeeDialogComponent;
  let fixture: ComponentFixture<BuyMeACoffeeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyMeACoffeeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyMeACoffeeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
