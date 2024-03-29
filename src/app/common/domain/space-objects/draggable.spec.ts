import { Draggable } from './draggable';
import { SpaceObject } from './space-object';
import { Orbit } from './orbit';
import { OrbitParameterData } from './orbit-parameter-data';
import { CameraComponent } from '../../../components/camera/camera.component';
import { ineeda } from 'ineeda';
import { MockBuilder, MockRender } from 'ng-mocks';
import { Component } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { Vector2 } from '../vector2';
import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
import { Common } from '../../common';
import createSpy = jasmine.createSpy;

let nameA = 'A';
let nameB = 'B';
let simpleChildren = {
  children: [
    {draggable: new Draggable(nameA, '', 'noMove')} as SpaceObject,
    {draggable: new Draggable(nameB, '', 'noMove')} as SpaceObject,
  ],
  nameA,
  nameB,
};

describe('Draggable class', () => {

  describe('children', () => {

    describe('setChildren()', () => {

      let draggable: Draggable;
      beforeEach(() => {
        draggable = new Draggable('', '', 'noMove');
      });

      it('given empty list, draggable is set to have no children', () => {
        expect(draggable.children.length).toBe(0);
        draggable.setChildren([]);

        expect(draggable.children.length).toBe(0);
      });

      it('given specific list, draggable contains those children', () => {
        draggable.setChildren(simpleChildren.children);

        expect(draggable.children.length).toBe(2);
        expect(draggable.children[0].label).toBe(simpleChildren.nameA);
        expect(draggable.children[1].label).toBe(simpleChildren.nameB);
      });
    });

    describe('addChild()', () => {

      let draggable: Draggable;
      beforeEach(() => {
        draggable = new Draggable('', '', 'noMove');
      });

      it('given child, parent contains that child', () => {
        let child = new Draggable('C', '', 'noMove');
        draggable.addChild(child);

        expect(draggable.children.length).toBe(1);
        expect(draggable.children[0].label).toBe('C');
      });

      it('given child, parent does not lose previous children', () => {
        draggable.setChildren(simpleChildren.children);

        expect(draggable.children.length).toBe(2);
        expect(draggable.children[0].label).toBe(simpleChildren.nameA);
        expect(draggable.children[1].label).toBe(simpleChildren.nameB);

        let child = new Draggable('C', '', 'noMove');
        draggable.addChild(child);

        expect(draggable.children.length).toBe(3);
        expect(draggable.children[0].label).toBe(simpleChildren.nameA);
        expect(draggable.children[1].label).toBe(simpleChildren.nameB);
        expect(draggable.children[2].label).toBe('C');
      });
    });

    describe('removeChild()', () => {

      let draggable: Draggable;
      beforeEach(() => {
        draggable = new Draggable('', '', 'noMove');
      });

      it('given child, parent no longer contains that child', () => {
        draggable.setChildren(simpleChildren.children);
        expect(draggable.children.length).toBe(2);

        let child = draggable.children[0];
        draggable.removeChild(child);

        expect(draggable.children.length).toBe(1);
        expect(draggable.children[0].label).not.toBe(child.label);
      });
    });

    describe('replaceChild()', () => {

      let draggable: Draggable;
      beforeEach(() => {
        draggable = new Draggable('', '', 'noMove');
      });

      it('given child, parent no longer contains that child', () => {
        draggable.setChildren(simpleChildren.children);
        expect(draggable.children[0].label).toBe(simpleChildren.nameA);
        expect(draggable.children.length).toBe(2);

        let oldChild = draggable.children[0];
        let newChild = new Draggable('C', '', 'noMove');
        draggable.replaceChild(oldChild, newChild);

        expect(draggable.children.length).toBe(2);
        expect(draggable.children[0]).not.toBe(oldChild);
        expect(draggable.children[0]).toBe(newChild);
      });
    });

  });

  describe('addOrbit()', () => {

    it('should add orbit and parameter data', () => {
      let draggable = new Draggable('', '', 'noMove');

      let orbitParameterData = new OrbitParameterData([1, 2], 3);
      let orbit = new Orbit(orbitParameterData, '');

      draggable.setOrbit(orbit);

      expect(draggable.orbit).toBe(orbit);
      expect(draggable.parameterData.xy[0]).toBe(1);
      expect(draggable.parameterData.xy[1]).toBe(2);
      expect(draggable.parameterData.r).toBe(3);
    });
  });

  describe('updateConstrainLocation()', () => {

    it('does not update location for immovable objects', () => {
      let draggable = new Draggable('', '', 'noMove');
      let orbitParameterData = new OrbitParameterData([0, 0]);
      draggable.updateConstrainLocation(orbitParameterData);

      let result = (draggable as any).constrainLocation(100, 100);
      expect(result).toEqual([0, 0]);
    });

    it('updates location for freely movable objects', () => {
      let draggable = new Draggable('', '', 'freeMove');
      let orbitParameterData = new OrbitParameterData([0, 0]);
      draggable.updateConstrainLocation(orbitParameterData);

      let result = (draggable as any).constrainLocation(100, 100);
      expect(result).toEqual([100, 100]);
    });

    it('updates location for orbital objects', () => {
      let draggable = new Draggable('', '', 'orbital');
      let orbitParameterData = new OrbitParameterData([1, 2], 3);
      draggable.updateConstrainLocation(orbitParameterData);

      // xy at [1,2] plus the radius offset of 3 (towards +x)
      expect(draggable.location.toString()).toBe('4 2');

      let result = (draggable as any).constrainLocation(-10, 1);
      expect(result[0] > -1.99 && result[0] < -1.98).toBe(true, result[0]);
      expect(result[1] > 1.72 && result[1] < 1.73).toBe(true);
    });

    it('updates location for SOI locked objects', () => {
      let draggable = new Draggable('', '', 'soiLock');
      let fakePlanetDraggable = ineeda<Draggable>({
        location: new Vector2(10, 10),
      });
      let orbitParameterData = new OrbitParameterData([4, 4], null, fakePlanetDraggable);
      draggable.updateConstrainLocation(orbitParameterData);

      expect(draggable.location.toString()).toBe('4 4');
    });
  });

  describe('startDrag()', () => {

    beforeEach(() => MockBuilder(TestDivComponent));

    it('temporarily sets SOI locked objects to be freely movable', async () => {
      let draggable = new Draggable('', '', 'soiLock');

      // @ts-ignore
      let oldConstrainLocationString = draggable.constrainLocation.toString();

      MockBuilder(TestDivComponent);
      let fixture = MockRender(TestDivComponent);

      let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('div');

      draggable.startDrag(
        new PointerEvent('pointerdown', {pointerType: 'mouse'}),
        screenSpace,
        () => void 0,
        ineeda<CameraComponent>(),
      );

      // @ts-ignore
      expect(draggable.constrainLocation.toString)
        .not.toBe(oldConstrainLocationString);

      screenSpace.dispatchEvent(new MouseEvent('mouseup'));

      draggable.destroy$.next();
    });

    it('pointer move events update the location', () => {
      let draggable = new Draggable('', '', 'orbital');
      draggable.location.set([0, 0]);

      let fixture = MockRender(TestDivComponent);
      let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('*');

      spyOn(draggable as any, 'getEventObservable')
        .and.returnValue(of({
        buttons: 1,
        pageX: 100,
        pageY: 0,
      }));

      draggable.startDrag(
        ineeda<PointerEvent>({
          pointerType: 'mouse',
          target: screenSpace,
        }),
        screenSpace,
        () => void 0,
        ineeda<CameraComponent>({
          location: new Vector2(0, 0),
          scale: 1
        }),
      );

      expect(draggable.location.x).not.toBe(0);

      screenSpace.dispatchEvent(new MouseEvent('mouseup'));

      draggable.destroy$.next();
    });

    it('in certain locations, the SOI under craft will activate', async () => {
      let draggable = new Draggable('', '', 'soiLock');
      draggable.location.set([0, 0]);

      let fixture = MockRender(TestDivComponent);
      fixture.detectChanges();
      let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.parentElement.querySelector('*');

      spyOn(draggable as any, 'getEventObservable')
        .and.returnValue(new BehaviorSubject({
        buttons: 1,
        pageX: 100,
        pageY: 0,
      }));

      new UniverseContainerInstance();
      let fakePlanet = ineeda<SpaceObject>({
        showSoi: false,
        draggableHandle: ineeda<Draggable>({
          removeChild: createSpy(),
          addChild: createSpy(),
        })
      });
      UniverseContainerInstance.instance.planets$.next([fakePlanet]);
      spyOn(UniverseContainerInstance.instance, 'getSoiParent')
        .and.returnValue(fakePlanet);

      expect(fakePlanet.showSoi).toBe(false);

      draggable.startDrag(
        ineeda<PointerEvent>({
          pointerType: 'mouse',
          target: screenSpace,
        }),
        screenSpace,
        () => void 0,
        ineeda<CameraComponent>({
          location: new Vector2(0, 0),
          scale: 1
        }),
      );

      await Common.waitPromise();

      expect(fakePlanet.showSoi).toBe(true);

      screenSpace.dispatchEvent(new MouseEvent('mouseup'));

      draggable.destroy$.next();
    });

  });

});

@Component({
  template: `
    <div>thing here</div>`,
})
export class TestDivComponent {
}
