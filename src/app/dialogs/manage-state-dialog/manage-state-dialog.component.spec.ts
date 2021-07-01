import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStateDialogComponent } from './manage-state-dialog.component';

describe('ManageStateDialogComponent', () => {
  let component: ManageStateDialogComponent;
  let fixture: ComponentFixture<ManageStateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageStateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
