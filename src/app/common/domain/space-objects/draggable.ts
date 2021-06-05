import { fromEvent, Subject } from 'rxjs';
import { filter, finalize, map, takeUntil, throttleTime } from 'rxjs/operators';
import { ConstrainLocationFunction } from '../constrain-location-function';
import { Vector2 } from '../vector2';
import { CameraComponent } from '../../../components/camera/camera.component';
import { LocationConstraints } from '../location-constraints';
import { SpaceObject } from './space-object';
import { Orbit } from './orbit';
import { OrbitParameterData } from './orbit-parameter-data';
import { WithDestroy } from '../../with-destroy';
import { SpaceObjectContainerService } from '../../../services/space-object-container.service';
import { MoveType } from './move-type';

export class Draggable extends WithDestroy() {

  isGrabbing: boolean;
  isHover$ = new Subject<boolean>();
  location = new Vector2();
  lastAttemptLocation: number[];
  children: Draggable[];
  parameterData = new OrbitParameterData();

  // tslint:disable:member-ordering
  private constrainLocation: ConstrainLocationFunction = (x, y) => [x, y];
  private parent: Draggable;
  public orbit: Orbit;

  constructor(public label: string,
              public imageUrl: string,
              public moveType: MoveType) {
    super();
    super.ngOnDestroy = () => {
      super.ngOnDestroy();
      this.isHover$.complete();
    };
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

    if (this.moveType === 'soiLock') {
      this.constrainLocation = LocationConstraints.anyMove(this.location.toList());
    }

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
          this.placeCraftInSoiLock();
          updateCallback();
        }),
        takeUntil(fromEvent(screen, 'mouseleave')),
        takeUntil(fromEvent(event.target, 'mouseup')),
        takeUntil(fromEvent(screen, 'mouseup')),
        takeUntil(this.destroy$))
      .subscribe(xy => {
        this.lastAttemptLocation = xy;
        this.setNewLocation(xy);
        this.showSoiUnderCraft();
        updateCallback();
      });
  }

  private setNewLocation([x, y]: number[]) {
    let newCenter = this.constrainLocation(x, y);
    this.location.set(newCenter);
    this.children && this.updateChildren(newCenter);
  }

  private updateChildren(newCenter: number[]) {
    if (!this.children) {
      return;
    }

    this.children
      .filter(d => d.moveType === 'orbital')
      .forEach(d => d.updateConstrainLocation({
        xy: newCenter,
        r: d.parameterData.r,
      }));

    this.children
      .filter(d => d.moveType === 'soiLock')
      .forEach(d => {
        let newLocation = d.constrainLocation(newCenter[0], newCenter[1]);
        d.location.set(newLocation);
        d.updateChildren(newLocation);
      });
  }

  updateConstrainLocation(parameterData: OrbitParameterData) {
    this.constrainLocation = LocationConstraints.fromMoveType(this.moveType, parameterData);

    // soiLock bodies need to account for the relative location difference from child -> parent
    let newLocation: number[];
    if (this.moveType === 'soiLock') {
      newLocation = parameterData.parent.location
        .subtractVector2Clone(Vector2.fromList(parameterData.xy))
        .add(parameterData.xy[0], parameterData.xy[1])
        .toList();
    } else {
      newLocation = this.lastAttemptLocation ?? parameterData.xy;
    }

    this.setNewLocation(newLocation);
    if (this.orbit) {
      this.orbit.parameters.xy = parameterData.xy;
    }
  }

  addOrbit(orbit: Orbit) {
    this.orbit = orbit;
    this.parameterData.xy = this.parent?.parameterData?.xy ?? orbit.parameters.xy;
    this.parameterData.r = orbit.parameters.r;
  }

  private placeCraftInSoiLock() {
    if (this.moveType !== 'soiLock' || !this.lastActivatedSoi) {
      return;
    }

    SpaceObjectContainerService.instance.celestialBodies$.value
      .map(cb => cb.draggableHandle)
      .forEach(d => d.removeChild(this));

    this.lastActivatedSoi.showSoi = false;
    this.lastActivatedSoi.draggableHandle.addChild(this);

    this.constrainLocation = LocationConstraints.soiLock(this.location, this.lastActivatedSoi.location);

    this.lastActivatedSoi = undefined;
  }

  private lastActivatedSoi: SpaceObject;

  private showSoiUnderCraft() {
    if (this.moveType !== 'soiLock') {
      return;
    }

    let soiParent = SpaceObjectContainerService.instance
      .getSoiParent(this.location);

    if (this.lastActivatedSoi) {
      this.lastActivatedSoi.showSoi = false;
    }
    soiParent.showSoi = true;
    this.lastActivatedSoi = soiParent;
  }

  addChild(draggable: Draggable) {
    this.children = this.children
      .filter(d => d !== draggable)
      .concat(draggable);
  }

  removeChild(draggable: Draggable) {
    this.children = this.children
      .filter(d => d !== draggable);
  }

  replaceChild(stale: Draggable, fresh: Draggable) {
    this.children.replace(stale, fresh, true);
  }
}
