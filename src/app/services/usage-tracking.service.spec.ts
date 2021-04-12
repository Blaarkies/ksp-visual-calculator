import { TestBed } from '@angular/core/testing';

import { UsageTrackingService } from './usage-tracking.service';

describe('UsageTrackingService', () => {
  let service: UsageTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsageTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
