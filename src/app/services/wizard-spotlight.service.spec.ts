import { TestBed } from '@angular/core/testing';

import { WizardSpotlightService } from './wizard-spotlight.service';

describe('WizardSpotlightService', () => {
  let service: WizardSpotlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WizardSpotlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
