import { TestBed } from '@angular/core/testing';

import { TutorialService } from './tutorial.service';

describe(TutorialService.name, () => {
  let service: TutorialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
