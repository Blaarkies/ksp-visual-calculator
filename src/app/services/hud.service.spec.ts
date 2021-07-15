import { TestBed } from '@angular/core/testing';

import { HudService } from './hud.service';

describe('HudService', () => {
  let service: HudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
