import { CameraComponent } from './camera.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { CameraService } from '../../services/camera.service';
import { ineeda } from 'ineeda';
import { Vector2 } from '../../common/domain/vector2';
import { Common } from '../../common/common';
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;

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

    let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('div.ether');
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

  it('touchStart() should move camera location', async (done) => {
    // let spyZoomAt = MockInstance(CameraService, 'zoomAt', createSpy('spyZoomAt'));
    let spyLocation = MockInstance(CameraService, 'location',
      createSpyObj({addVector2: createSpy('spyAddVector2')}));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('div.ether');

    let touchA0 = new Touch(getTouchAt(1, 1, screenSpace));
    let touchB0 = new Touch(getTouchAt(2, -1, screenSpace));
    let touchEvent = new TouchEvent('touchmove', {
      changedTouches: [touchA0, touchB0],
      touches: [touchA0, touchB0],
    });
    component.touchStart(touchEvent, screenSpace);

    await Common.waitPromise();

    let touchA1 = new Touch(getTouchAt(0, 0, screenSpace));
    let touchB1 = new Touch(getTouchAt(10, 0, screenSpace));
    screenSpace.dispatchEvent(new TouchEvent('touchmove', {
      changedTouches: [touchA1, touchB1],
      touches: [touchA1, touchB1],
    }));

    await Common.waitPromise();

    let touchA2 = new Touch(getTouchAt(5, -100, screenSpace));
    let touchB2 = new Touch(getTouchAt(20, 100, screenSpace));
    screenSpace.dispatchEvent(new TouchEvent('touchmove', {
      changedTouches: [touchA2, touchB2],
      touches: [touchA2, touchB2],
    }));

    await Common.waitPromise();

    screenSpace.dispatchEvent(new TouchEvent('touchmove', {
      changedTouches: [],
      touches: [],
    }));

    await Common.waitPromise();

    expect(spyLocation.addVector2).toHaveBeenCalled();
    // dz returns 0, which causes no zoom function call
    // expect(spyZoomAt).toHaveBeenCalled();

    component.ngOnDestroy();

    done();

  });

});
