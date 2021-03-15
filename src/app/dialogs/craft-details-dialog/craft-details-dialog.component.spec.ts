import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CraftDetailsDialogComponent } from './craft-details-dialog.component';

describe('CraftDetailsDialogComponent', () => {
  let component: CraftDetailsDialogComponent;
  let fixture: ComponentFixture<CraftDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CraftDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CraftDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
