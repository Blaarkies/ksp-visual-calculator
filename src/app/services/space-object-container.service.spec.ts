import { TestBed } from '@angular/core/testing';

import { SpaceObjectContainerService } from './space-object-container.service';

describe('SpaceObjectContainerService', () => {
  let service: SpaceObjectContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpaceObjectContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
