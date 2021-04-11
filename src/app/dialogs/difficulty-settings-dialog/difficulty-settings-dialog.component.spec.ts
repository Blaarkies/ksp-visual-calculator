import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifficultySettingsDialogComponent } from './difficulty-settings-dialog.component';

describe('DifficultySettingsDialogComponent', () => {
  let component: DifficultySettingsDialogComponent;
  let fixture: ComponentFixture<DifficultySettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DifficultySettingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DifficultySettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
