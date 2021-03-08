import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableSpaceObjectComponent } from './draggable-space-object.component';

describe('DraggableSpaceObjectComponent', () => {
  let component: DraggableSpaceObjectComponent;
  let fixture: ComponentFixture<DraggableSpaceObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DraggableSpaceObjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableSpaceObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
