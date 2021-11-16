import { FocusJumpToPanelComponent } from './focus-jump-to-panel.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { SpaceObjectService } from '../../services/space-object.service';
import { ineeda } from 'ineeda';
import { BehaviorSubject, of } from 'rxjs';
import { Craft } from '../../common/domain/space-objects/craft';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { CameraService } from '../../services/camera.service';
import { Draggable } from '../../common/domain/space-objects/draggable';
import { MatButton } from '@angular/material/button';
import createSpy = jasmine.createSpy;

let componentType = FocusJumpToPanelComponent;
describe('FocusJumpToPanelComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .keep(MatButton)
    .mock(AppModule)
    .mock(SpaceObjectService, ineeda<SpaceObjectService>({
      crafts$: of([]) as BehaviorSubject<Craft[]>,
      celestialBodies$: of([]) as BehaviorSubject<SpaceObject[]>,
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  let spaceObjects: SpaceObject[] = [
    ineeda<SpaceObject>({label: 'A', draggableHandle: ineeda<Draggable>()}),
    ineeda<SpaceObject>({label: 'B', draggableHandle: ineeda<Draggable>()}),
    ineeda<SpaceObject>({label: 'C', draggableHandle: ineeda<Draggable>()}),
  ];

  it('changes to spaceObjectService should update list', () => {
    let celestialBodies$ = new BehaviorSubject<SpaceObject[]>([]);
    MockInstance(SpaceObjectService, 'celestialBodies$', celestialBodies$);

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    expect(component.list.length).toBe(0);

    celestialBodies$.next([ineeda<SpaceObject>()]);

    expect(component.list.length).toBe(1);
    celestialBodies$.complete();
  });

  it('list item actions should call CameraService.focusSpaceObject()', () => {
    let celestialBodies$ = new BehaviorSubject<SpaceObject[]>([spaceObjects[0]]);
    MockInstance(SpaceObjectService, 'celestialBodies$', celestialBodies$);
    let spyFocusSpaceObject = MockInstance(CameraService, 'focusSpaceObject', createSpy('spyFocusSpaceObject'));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.list[0].itemAction();

    fixture.detectChanges();

    expect(spyFocusSpaceObject).toHaveBeenCalled();
    celestialBodies$.complete();
  });

  it('pressing tab should focusNextBody()', () => {
    let celestialBodies$ = new BehaviorSubject<SpaceObject[]>([spaceObjects[0]]);
    MockInstance(SpaceObjectService, 'celestialBodies$', celestialBodies$);

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component, 'focusNextBody' as any);

    window.dispatchEvent(new KeyboardEvent('keyup',
      {key: 'Tab', shiftKey: false}));
    expect((component as any).focusNextBody).toHaveBeenCalledWith(false);

    window.dispatchEvent(new KeyboardEvent('keyup',
      {key: 'Tab', shiftKey: true}));
    expect((component as any).focusNextBody).toHaveBeenCalledWith(true);

    celestialBodies$.complete();
  });

  it('holding down shift should affect next body direction on focusNextBody', () => {
    let celestialBodies$ = new BehaviorSubject<SpaceObject[]>(spaceObjects);
    MockInstance(SpaceObjectService, 'celestialBodies$', celestialBodies$);
    MockInstance(CameraService, 'lastFocusObject', spaceObjects[1].draggableHandle);
    let spyFocusSpaceObject = MockInstance(CameraService, 'focusSpaceObject', createSpy().and.callFake(so => void 0));

    MockRender(componentType);

    window.dispatchEvent(new KeyboardEvent('keyup',
      {key: 'Tab', shiftKey: false}));

    let newFocusObject = spyFocusSpaceObject.calls.mostRecent().args[0];
    expect(newFocusObject.label).toBe(spaceObjects[2].label);

    window.dispatchEvent(new KeyboardEvent('keyup',
      {key: 'Tab', shiftKey: true}));

    newFocusObject = spyFocusSpaceObject.calls.mostRecent().args[0];
    // 'spaceObjects[0].label', because 'lastFocusObject' is mocked on CameraService Instance to [1]
    expect(newFocusObject.label).toBe(spaceObjects[0].label);
    celestialBodies$.complete();
  });

  it('when not holding down shift, focusNextBody should loop forward around at end of list', () => {
    let celestialBodies$ = new BehaviorSubject<SpaceObject[]>(spaceObjects);
    MockInstance(SpaceObjectService, 'celestialBodies$', celestialBodies$);
    MockInstance(CameraService, 'lastFocusObject', spaceObjects[2].draggableHandle);
    let spyFocusSpaceObject = MockInstance(CameraService, 'focusSpaceObject', createSpy().and.callFake(so => void 0));

    MockRender(componentType);

    window.dispatchEvent(new KeyboardEvent('keyup',
      {key: 'Tab', shiftKey: false}));

    let newFocusObject = spyFocusSpaceObject.calls.mostRecent().args[0];
    expect(newFocusObject.label).toBe(spaceObjects[0].label);
    celestialBodies$.complete();
  });

  it('when holding down shift, focusNextBody should loop backward around at end of list', () => {
    let celestialBodies$ = new BehaviorSubject<SpaceObject[]>(spaceObjects);
    MockInstance(SpaceObjectService, 'celestialBodies$', celestialBodies$);
    MockInstance(CameraService, 'lastFocusObject', spaceObjects[0].draggableHandle);
    let spyFocusSpaceObject = MockInstance(CameraService, 'focusSpaceObject', createSpy().and.callFake(so => void 0));

    MockRender(componentType);

    window.dispatchEvent(new KeyboardEvent('keyup',
      {key: 'Tab', shiftKey: true}));

    let newFocusObject = spyFocusSpaceObject.calls.mostRecent().args[0];
    expect(newFocusObject.label).toBe(spaceObjects[2].label);
    celestialBodies$.complete();
  });

});
