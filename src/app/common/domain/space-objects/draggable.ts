import { filter, finalize, fromEvent, map, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { ConstrainLocationFunction } from '../constrain-location-function';
import { Vector2 } from '../vector2';
import { CameraComponent } from '../../../components/camera/camera.component';
import { LocationConstraints } from '../location-constraints';
import { SpaceObject } from './space-object';
import { Orbit } from './orbit';
import { OrbitParameterData } from './orbit-parameter-data';
import { WithDestroy } from '../../with-destroy';
import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
import { MoveType } from './move-type';

export class Draggable extends WithDestroy() {

  isGrabbing: boolean;
  isHover$ = new Subject<boolean>();
  location = new Vector2();
  lastAttemptLocation: number[];
  children: Draggable[] = [];
  parameterData = new OrbitParameterData();

  // tslint:disable:member-ordering
  private constrainLocation: ConstrainLocationFunction = (x, y) => [x, y];
  private lastActivatedSoi: SpaceObject;
  public parent: Draggable;
  public orbit: Orbit;

  toJson(): {} {
    return {
      location: this.location.toList(),
      lastAttemptLocation: this.lastAttemptLocation,
      children: this.children?.map(d => d.label),
      orbit: this.orbit?.toJson(),
      label: this.label,
      imageUrl: this.imageUrl,
      moveType: this.moveType,
    };
  }

  constructor(public label: string,
              public imageUrl: string,
              public moveType: MoveType) {
    super();
    super.ngOnDestroy = () => {
      // workaround, error NG2007: Class is using Angular features but is not decorated.
      super.ngOnDestroy();
      this.isHover$.complete();
    };
  }

  startDrag(event: PointerEvent,
            screen: HTMLDivElement,
            updateCallback: () => void,
            camera: CameraComponent) {
    if (this.moveType === 'soiLock') {
      this.constrainLocation = LocationConstraints.anyMove(this.location.toList());
    }

    updateCallback();

    let pointerStream: Observable<Vector2>;

    if (event.pointerType === 'mouse') {
      screen.style.cursor = 'grabbing';
      this.isGrabbing = true;

      pointerStream = this.getEventObservable(screen, 'mousemove')
        .pipe(
          throttleTime(17),
          // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
          filter((move: MouseEvent) => move.buttons.bitwiseIncludes(1)),
          map((move: MouseEvent) => new Vector2(move.pageX, move.pageY)),
          finalize(() => {
            screen.style.cursor = 'unset';
            this.isGrabbing = false;
          }),
          takeUntil(fromEvent(screen, 'mouseleave')),
          takeUntil(fromEvent(event.target, 'mouseup')),
          takeUntil(fromEvent(screen, 'mouseup')));

    } else if (event.pointerType === 'touch') {
      pointerStream = this.getEventObservable(screen, 'touchmove')
        .pipe(
          throttleTime(17),
          filter((touch: TouchEvent) => touch.changedTouches.length === 1),
          map((touchEvent: TouchEvent) => {
            let touch = touchEvent.touches[0];
            return new Vector2(touch.pageX, touch.pageY);
          }),
          takeUntil(fromEvent(screen, 'touchcancel')),
          takeUntil(fromEvent(event.target, 'touchend')),
          takeUntil(fromEvent(screen, 'touchend')));
    }

    pointerStream.pipe(
      map(vector => camera.convertScreenToGameSpace(vector)),
      finalize(() => {
        this.placeCraftInSoiLock();
        updateCallback();
      }),
      takeUntil(this.destroy$))
      .subscribe(vector => {
        let xy = vector.toList();

        this.lastAttemptLocation = xy;
        this.setNewLocation(xy);
        this.showSoiUnderCraft();
        updateCallback();
      });
  }

  /**
   * Function that improves testability on startDrag() code
   */
  private getEventObservable(screen: HTMLDivElement, eventType: 'mousemove' | 'touchmove') {
    return fromEvent(screen, eventType);
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
      } as OrbitParameterData));

    this.children
      .filter(d => d.moveType === 'soiLock')
      .forEach(d => {
        let newLocation = d.constrainLocation(newCenter[0], newCenter[1]);
        d.location.set(newLocation);
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

    UniverseContainerInstance.instance.celestialBodies$.value
      .map(cb => cb.draggableHandle)
      .forEach(d => d.removeChild(this));

    this.lastActivatedSoi.showSoi = false;
    this.lastActivatedSoi.draggableHandle.addChild(this);

    this.constrainLocation = LocationConstraints.soiLock(this.location, this.lastActivatedSoi.location);
    this.parent = this.lastActivatedSoi.draggableHandle;

    this.lastActivatedSoi = undefined;
  }

  private showSoiUnderCraft() {
    if (this.moveType !== 'soiLock') {
      return;
    }

    let soiParent = UniverseContainerInstance.instance
      .getSoiParent(this.location);

    if (this.lastActivatedSoi) {
      this.lastActivatedSoi.showSoi = false;
    }
    soiParent.showSoi = true;
    this.lastActivatedSoi = soiParent;
  }

  setChildren(spaceObjects: SpaceObject[]) {
    let draggables = spaceObjects.map(so => so.draggableHandle);
    this.children = draggables;
    draggables.forEach(so => so.parent = this);
  }

  addChild(draggable: Draggable) {
    this.children = this.children
      .filter(d => d !== draggable)
      .concat(draggable);
    draggable.parent = this;
  }

  removeChild(draggable: Draggable) {
    this.children = this.children
      .filter(d => d !== draggable);
  }

  replaceChild(stale: Draggable, fresh: Draggable) {
    this.children.replace(stale, fresh, true);
    stale.parent = undefined;
    fresh.parent = this;
  }

}
