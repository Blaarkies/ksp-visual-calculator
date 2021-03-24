import { fromEvent } from 'rxjs';
import { filter, finalize, map, takeUntil, throttleTime } from 'rxjs/operators';
import { ConstrainLocationFunction } from '../constrain-location-function';
import { Vector2 } from '../vector2';
import { CameraComponent } from '../../../components/camera/camera.component';
import { LocationConstraints } from '../location-constraints';
import { SpaceObject } from './space-object';
import { Orbit } from './orbit';
import { OrbitParameterData } from './orbit-parameter-data';

export class Draggable {

  isGrabbing: boolean;
  location = new Vector2();
  lastAttemptLocation: number[];
  children: Draggable[];
  parameterData: OrbitParameterData = new OrbitParameterData();

  private constrainLocation: ConstrainLocationFunction = (x, y) => [x, y];
  private parent: Draggable;
  private orbit: Orbit;

  constructor(public label: string,
              public imageUrl: string,
              public moveType: 'noMove' | 'freeMove' | 'orbital') {
  }

  setChildren(spaceObjects: SpaceObject[]) {
    let draggables = spaceObjects.map(so => so.draggableHandle);
    this.children = draggables;
    draggables.forEach(so => so.parent = this);
  }

  startDrag(event: MouseEvent,
            screen: HTMLDivElement,
            updateCallback: () => void = () => void 0,
            camera?: CameraComponent) {
    screen.style.cursor = 'grabbing';
    this.isGrabbing = true;
    updateCallback();

    fromEvent(screen, 'mousemove')
      .pipe(
        throttleTime(25),
        // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
        filter((move: MouseEvent) => move.buttons.bitwiseIncludes(1)),
        map((move: MouseEvent) => [move.pageX - camera.location.x, move.pageY - camera.location.y]),
        map(pair => camera
          ? [pair[0] / camera.scale, pair[1] / camera.scale]
          : pair),
        finalize(() => {
          screen.style.cursor = 'unset';
          this.isGrabbing = false;
          updateCallback();
        }),
        takeUntil(fromEvent(screen, 'mouseleave')),
        takeUntil(fromEvent(event.target, 'mouseup')),
        takeUntil(fromEvent(screen, 'mouseup')))
      .subscribe(xy => {
        this.lastAttemptLocation = xy;
        this.setNewLocation(xy);
        updateCallback();
      });
  }

  private setNewLocation([x, y]: number[]) {
    let newCenter = this.constrainLocation(x, y);
    this.location.set(newCenter);
    this.children && this.updateChildren(newCenter);
  }

  private updateChildren(newCenter: number[]) {
    this.children.forEach(m => m.updateConstrainLocation({
      xy: newCenter,
      r: m.parameterData.r,
    }));
  }

  updateConstrainLocation(parameterData: OrbitParameterData) {
    this.constrainLocation = LocationConstraints.fromMoveType(this.moveType, parameterData);
    this.setNewLocation(this.lastAttemptLocation ?? parameterData.xy);
    if (this.orbit) {
      this.orbit.parameters.xy = parameterData.xy;
    }
  }

  addOrbit(orbit: Orbit) {
    this.orbit = orbit;
    this.parameterData.xy = this.parent?.parameterData?.xy ?? orbit.parameters.xy;
    this.parameterData.r = orbit.parameters.r;
  }

}
