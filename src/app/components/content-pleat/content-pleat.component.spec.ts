import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPleatComponent } from './content-pleat.component';

describe('ContentFoldComponent', () => {
  let component: ContentPleatComponent;
  let fixture: ComponentFixture<ContentPleatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentPleatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPleatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
