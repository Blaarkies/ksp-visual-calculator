import { CameraComponent } from './camera.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { CameraService } from '../../services/camera.service';
import { ineeda } from 'ineeda';
import { Vector2 } from '../../common/domain/vector2';
import { fakeAsync, tick } from '@angular/core/testing';
import createSpy = jasmine.createSpy;

let componentType = CameraComponent;
describe('CameraComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(CameraService, {
      scale: 1,
    }));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('updateScale() calls cameraService.zoomAt', () => {
    let spyCameraService = MockInstance(CameraService, 'zoomAt', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.updateScale(ineeda<WheelEvent>({
      deltaY: 99,
    }));

    expect(spyCameraService).toHaveBeenCalled();
  });

  it('mouseDown() should move camera location', () => {
    let location = MockInstance(CameraService, 'location', new Vector2());

    spyOn(location, 'add');

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('div.camera-controller');
    component.mouseDown(ineeda<MouseEvent>({buttons: 2}), screenSpace);

    screenSpace.dispatchEvent(new MouseEvent('mousemove', {
      movementX: 100,
      movementY: 100,
    }));

    expect(location.add).toHaveBeenCalled();
  });

  let getTouchAt = (x, y, target) => ({
    altitudeAngle: 0,
    azimuthAngle: 0,
    clientX: 0,
    clientY: 0,
    force: 0,
    identifier: 0,
    pageX: 0,
    pageY: 0,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    screenX: 0,
    screenY: 0,
    target,
    touchType: 'direct',
  } as TouchInit);
  it('touchStart() should move camera location', fakeAsync(() => {
    let spyZoomAt = MockInstance(CameraService, 'zoomAt', createSpy());
    let location = MockInstance(CameraService, 'location', new Vector2());

    spyOn(location, 'addVector2');

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('div.camera-controller');
    component.touchStart(ineeda<TouchEvent>(), screenSpace);

    let touchA1 = new Touch(getTouchAt(0, 0, screenSpace));
    let touchB1 = new Touch(getTouchAt(10, 0, screenSpace));
    screenSpace.dispatchEvent(new TouchEvent('touchmove', {
      changedTouches: [touchA1, touchB1],
      touches: [touchA1, touchB1],
    }));

    tick(100);

    let touchA2 = new Touch(getTouchAt(5, 0, screenSpace));
    let touchB2 = new Touch(getTouchAt(20, 0, screenSpace));
    screenSpace.dispatchEvent(new TouchEvent('touchmove', {
      changedTouches: [touchA2, touchB2],
      touches: [touchA2, touchB2],
    }));

    tick(100);

    expect(location.addVector2).toHaveBeenCalled();
    expect(spyZoomAt).toHaveBeenCalled();

    component.ngOnDestroy();
  }));

});
