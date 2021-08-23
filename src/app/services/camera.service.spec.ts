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

  xit('when hoverObject exists, zoomAt() should update scale & location towards hoverObject', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;

    service.currentHoverObject = ineeda<Draggable>(
      {location: new Vector2(10e9, 15e9)});
    service.zoomAt(1);

    expect(service.location).toEqual(objectContaining(
      {x: 1460, y: 1290}));
    expect(service.scale).toBe(5e-8);
  });

  xit('when hoverObject is null, zoomAt() should update scale & location towards mouseLocation', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;

    service.zoomAt(1, new Vector2(-10e9, 5e9));

    expect(service.location).toEqual(objectContaining(
      {x: 1460, y: 1290}));
    expect(service.scale).toBe(5e-8);
  });

  it('focusAt() should update scale & location', () => {
    let fixture = MockRender(serviceType, {cdr});
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    serviceAsAny.focusAt(new Vector2(-10e9, 5e9), SpaceObjectType.Moon, true);

    expect(service.location).toEqual(objectContaining(
      {x: 22671.5, y: -10840}));
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
