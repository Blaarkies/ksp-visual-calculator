import { PageSignalCheckComponent } from './page-signal-check.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { StateService } from '../../services/state.service';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { HudService } from '../../services/hud.service';
import { ineeda } from 'ineeda';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Draggable } from '../../common/domain/space-objects/draggable';
import { SpaceObjectService } from '../../services/space-object.service';
import { MatDialog } from '@angular/material/dialog';
import { CelestialBodyDetailsDialogComponent } from '../../overlays/celestial-body-details-dialog/celestial-body-details-dialog.component';
import { Craft } from '../../common/domain/space-objects/craft';
import { CraftDetailsDialogComponent } from '../../overlays/craft-details-dialog/craft-details-dialog.component';
import { CameraService } from '../../services/camera.service';
import createSpy = jasmine.createSpy;
import objectContaining = jasmine.objectContaining;
import arrayContaining = jasmine.arrayContaining;

let componentType = PageSignalCheckComponent;
describe('PageSignalCheckComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(SpaceObjectService, {
      orbits$: of([]),
      transmissionLines$: of([]),
      celestialBodies$: of([]),
      crafts$: of([]),
    } as any)
    .mock(StateService, {loadState: () => EMPTY}));

  it('should create', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    expect(component).toBeDefined();
  });

  it('constructor should set pageContext', () => {
    let spyHudContext = MockInstance(HudService, 'pageContext', createSpy(), 'set');
    let spyStateContext = MockInstance(StateService, 'pageContext', createSpy(), 'set');
    let spyStateLoadState = MockInstance(StateService, 'loadState', createSpy()
      .and.returnValue(of(0)));

    MockRender(componentType);

    expect(spyHudContext).toHaveBeenCalled();
    expect(spyStateContext).toHaveBeenCalled();
    expect(spyStateLoadState).toHaveBeenCalled();
  });

  it('startBodyDrag() should call startDrag on draggable', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let spyStartDrag = createSpy();
    let body = ineeda<SpaceObject>({
      label: '',
      draggableHandle: ineeda<Draggable>({
        startDrag: spyStartDrag,
      }),
    });
    let event = {} as any;
    let screen = {} as any;
    let camera = {} as any;
    component.startBodyDrag(body, event, screen, camera);

    let [spyEvent, spyScreen, spyCallback, spyCamera]
      = spyStartDrag.calls.mostRecent().args;

    expect(spyEvent).toBe(event);
    expect(spyScreen).toBe(screen);
    expect(typeof spyCallback).toBe('function');
    expect(spyCamera).toBe(camera);
  });

  it('updateUniverse() should update transmission lines', () => {
    let spyUpdateTransmissionLines = MockInstance(SpaceObjectService, 'updateTransmissionLines', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    (component as any).updateUniverse(ineeda<SpaceObject>({
      antennae: [1] as any,
    }));

    expect(spyUpdateTransmissionLines).toHaveBeenCalled();
  });

  it('editCelestialBody() should call planets dialog with correct data', () => {
    let spyOpen = MockInstance(MatDialog, 'open', createSpy()
      .and.returnValue({
        afterClosed: () => of('test-details' as any),
      }));
    let spyEditCelestialBody = MockInstance(SpaceObjectService, 'editCelestialBody', createSpy());
    MockInstance(SpaceObjectService, 'celestialBodies$', new BehaviorSubject<SpaceObject[]>([
      {label: 'test-name'} as any]));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let body = {label: 'test-body'} as any;
    component.editCelestialBody(body);

    expect(spyOpen).toHaveBeenCalledWith(CelestialBodyDetailsDialogComponent, objectContaining({
      data: {
        forbiddenNames: arrayContaining(['test-name']),
        edit: body,
      },
    }));
    expect(spyEditCelestialBody).toHaveBeenCalledWith(body, 'test-details');
  });

  it('editCraft() should call craft dialog with correct data', () => {
    let spyOpen = MockInstance(MatDialog, 'open', createSpy()
      .and.returnValue({
        afterClosed: () => of('test-details' as any),
      }));
    let spyEditCraft = MockInstance(SpaceObjectService, 'editCraft', createSpy());
    MockInstance(SpaceObjectService, 'crafts$', new BehaviorSubject<Craft[]>([
      {label: 'test-name', draggableHandle: {}, spriteLocation: {}} as any]));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let craft = {label: 'test-craft'} as any;
    component.editCraft(craft);

    expect(spyOpen).toHaveBeenCalledWith(CraftDetailsDialogComponent, objectContaining({
      data: {
        forbiddenNames: arrayContaining(['test-name']),
        edit: craft,
      },
    }));
    expect(spyEditCraft).toHaveBeenCalledWith(craft, 'test-details');
  });

  it('focusBody() should call cameraService.focusSpaceObject', () => {
    let spyFocusSpaceObject = MockInstance(CameraService, 'focusSpaceObject', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.focusBody(ineeda<SpaceObject>({label: ''}), ineeda<PointerEvent>());

    expect(spyFocusSpaceObject).toHaveBeenCalled();
  });

});
