import { DraggableSpaceObjectComponent } from './draggable-space-object.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { ineeda } from 'ineeda';
import { CameraService } from '../../services/camera.service';
import { Draggable } from '../../common/domain/space-objects/draggable';
import createSpy = jasmine.createSpy;

let componentType = DraggableSpaceObjectComponent;
describe('DraggableSpaceObjectComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  let spaceObject = ineeda<SpaceObject>({
    draggableHandle: ineeda<Draggable>(),
  });

  it('should create', () => {
    let fixture = MockRender(componentType, {spaceObject});
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('buttonHover$ true should add draggable to camera', () => {
    MockInstance(CameraService, 'currentHoverObject',
      createSpy(), 'get');
    let spySetCurrentHoverObject = MockInstance(CameraService, 'currentHoverObject',
      createSpy(), 'set');

    let fixture = MockRender(componentType, {spaceObject});
    let component = fixture.point.componentInstance;

    component.buttonHover$.next(true);

    expect(spySetCurrentHoverObject).toHaveBeenCalledWith(spaceObject.draggableHandle);
  });

  it('buttonHover$ false, with object already set, should remove draggable from camera', () => {
    MockInstance(CameraService, 'currentHoverObject',
      createSpy().and.returnValue(spaceObject.draggableHandle), 'get');
    let spySetCurrentHoverObject = MockInstance(CameraService, 'currentHoverObject',
      createSpy(), 'set');

    let fixture = MockRender(componentType, {spaceObject});
    let component = fixture.point.componentInstance;

    component.buttonHover$.next(false);

    expect(spySetCurrentHoverObject).toHaveBeenCalledWith(null);
  });

});
