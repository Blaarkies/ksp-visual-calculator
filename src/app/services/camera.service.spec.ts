import { TestBed } from '@angular/core/testing';

import { CameraService } from './camera.service';

describe(CameraService.name, () => {
  let service: CameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
