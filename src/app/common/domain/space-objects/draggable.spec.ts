import { Draggable } from './draggable';
import { SpaceObject } from './space-object';
import { Orbit } from './orbit';
import { OrbitParameterData } from './orbit-parameter-data';
import { CameraComponent } from '../../../components/camera/camera.component';
import { ineeda } from 'ineeda';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { Component } from '@angular/core';
import { BehaviorSubject, fromEvent, of, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { Vector2 } from '../vector2';
import { SpaceObjectContainerService } from '../../../services/space-object-container.service';
import createSpy = jasmine.createSpy;

let nameA = 'A';
let nameB = 'B';
let simpleChildren = {
  children: [
    {draggableHandle: new Draggable(nameA, '', 'noMove')} as SpaceObject,
    {draggableHandle: new Draggable(nameB, '', 'noMove')} as SpaceObject,
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

      draggable.addOrbit(orbit);

      expect(draggable.orbit).toBe(orbit);
      expect(draggable.parameterData.xy[0]).toBe(1);
      expect(draggable.parameterData.xy[1]).toBe(2);
      expect(draggable.parameterData.r).toBe(3);
    });
  });

  describe('updateConstrainLocation()', () => {

    xit('does not update location for immovable objects', () => {
    });

    xit('updates location for freely movable objects', () => {
    });

    it('updates location for orbital objects', () => {
      let draggable = new Draggable('', '', 'orbital');
      let orbitParameterData = new OrbitParameterData([1, 2], 3);
      draggable.updateConstrainLocation(orbitParameterData);

      // xy at [1,2] plus the radius offset of 3 (towards +x)
      expect(draggable.location.toString()).toBe('4 2');
    });

    xit('updates location for SOI locked objects', () => {
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
      let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('div');

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
      let screenSpace: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('div');

      spyOn(draggable as any, 'getEventObservable')
        .and.returnValue(new BehaviorSubject({
        buttons: 1,
        pageX: 100,
        pageY: 0,
      }));

      new SpaceObjectContainerService();
      let fakePlanet = ineeda<SpaceObject>({
        showSoi: false,
        draggableHandle: ineeda<Draggable>({
          removeChild: createSpy(),
          addChild: createSpy(),
        })
      });
      SpaceObjectContainerService.instance.celestialBodies$.next([fakePlanet]);
      spyOn(SpaceObjectContainerService.instance, 'getSoiParent')
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

      await timer(100).pipe(take(1)).toPromise();

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
