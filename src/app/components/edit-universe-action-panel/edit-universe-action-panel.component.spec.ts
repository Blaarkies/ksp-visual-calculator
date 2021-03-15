import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUniverseActionPanelComponent } from './edit-universe-action-panel.component';

describe('EditUniverseActionPanelComponent', () => {
  let component: EditUniverseActionPanelComponent;
  let fixture: ComponentFixture<EditUniverseActionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditUniverseActionPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUniverseActionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
