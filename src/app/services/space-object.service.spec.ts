import { TestBed } from '@angular/core/testing';

import { SpaceObjectService } from './space-object.service';

describe('SpaceObjectService', () => {
  let service: SpaceObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpaceObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
