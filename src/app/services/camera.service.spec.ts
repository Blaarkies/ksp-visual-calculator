import { CameraService } from './camera.service';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { Vector2 } from '../common/domain/vector2';
import { ineeda } from 'ineeda';
import { Draggable } from '../common/domain/space-objects/draggable';
import objectContaining = jasmine.objectContaining;
import createSpy = jasmine.createSpy;
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { fakeAsync, tick } from '@angular/core/testing';

let serviceType = CameraService;
describe('CameraService', () => {

  let cdr: { markForCheck };
  beforeEach(() => {
    cdr = {
      markForCheck: createSpy(),
    };
    return MockBuilder(serviceType).mock(AppModule);
  });

  it('should be created', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  it('reset() should reset scale & location', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;

    service.reset(1, new Vector2(1, 1));
    expect(service.scale).toBe(1);
    expect(service.location).toEqual(objectContaining({x: 1, y: 1}));

    service.reset();
    expect(service.scale).toBe(5e-8);
    expect(service.location).toEqual(objectContaining({x: 960, y: 540}));
  });

  it('when hoverObject exists, zoomAt() should update scale & location towards hoverObject', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;

    service.scale = 23e-5;
    service.currentHoverObject = {location: new Vector2(2e5, 3e5)} as any;

    service.zoomAt(.1);

    expect(service.location).toEqual(objectContaining(
      {x: 1001.4, y: 602.1}));
    expect(service.scale.toFixed(7).toNumber()).toBe(0.000023);
  });

  it('when hoverObject is null, zoomAt() should update scale & location towards mouseLocation', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;

    service.zoomAt(.1, new Vector2(-10e4, 5e4));

    expect(service.location).toEqual(objectContaining(
      {x: -89904, y: 45054}));
    expect(service.scale).toBe(5e-9);
  });

  it('focusAt() should update scale & location', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    serviceAsAny.focusAt(new Vector2(-10e9, 5e9), SpaceObjectType.Moon, true);

    expect(service.location.x).toBeCloseTo(22672.5, -1);
    expect(service.location.y).toBeCloseTo(-10840, -1);
    expect(service.scale).toBe(.000002228);

    spyOn(serviceAsAny, 'getScaleForFocus').and.returnValue(0);
    serviceAsAny.focusAt(new Vector2(-10e9, 5e9), SpaceObjectType.Moon, false);

    expect(serviceAsAny.getScaleForFocus).toHaveBeenCalled();
  });

  it('focusSpaceObject() should set lastFocusObject & call focusAt', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOn(serviceAsAny, 'focusAt');
    service.focusSpaceObject(ineeda<SpaceObject>());

    expect(serviceAsAny.focusAt).toHaveBeenCalled();
  });

  it('destroy() should destroy smoothSetters', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOn(serviceAsAny.scaleSmoothSetter, 'destroy');
    spyOn(serviceAsAny.locationSmoothSetter, 'destroy');
    service.destroy();

    expect(serviceAsAny.scaleSmoothSetter.destroy).toHaveBeenCalled();
    expect(serviceAsAny.locationSmoothSetter.destroy).toHaveBeenCalled();
  });

});
