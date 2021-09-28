import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MspNodeComponent } from './msp-node.component';

describe('MspNodeComponent', () => {
  let component: MspNodeComponent;
  let fixture: ComponentFixture<MspNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MspNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MspNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
