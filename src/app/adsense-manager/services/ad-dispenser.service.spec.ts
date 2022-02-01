import { TestBed } from '@angular/core/testing';

import { AdDispenserService } from './ad-dispenser.service';

describe('AdDispenserService', () => {
  let service: AdDispenserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdDispenserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
