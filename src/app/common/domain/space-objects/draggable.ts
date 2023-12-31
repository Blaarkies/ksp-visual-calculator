import {
  filter,
  finalize,
  fromEvent,
  map,
  Observable,
  Subject,
  takeUntil,
  throttleTime,
} from 'rxjs';
import { CameraComponent } from '../../../components/camera/camera.component';
import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
import { SubjectHandle } from '../../subject-handle';
import { ConstrainLocationFunction } from '../constrain-location-function';
import { DraggableDto } from '../dtos/draggable.dto';
import { LocationConstraints } from '../location-constraints';
import { Vector2 } from '../vector2';
import { MoveType } from './move-type';
import { Orbit } from './orbit';
import { OrbitParameterData } from './orbit-parameter-data';
import { Planetoid } from './planetoid';
import { SpaceObject } from './space-object';

export class Draggable {

  isGrabbing$ = new SubjectHandle<boolean>({defaultValue: false});
  isHover$ = new Subject<boolean>();
  location = new Vector2();
  lastAttemptLocation: number[];
  children: Draggable[] = [];

  parameterData = new OrbitParameterData(); // TODO: replace using orbit directly
  orbit?: Orbit;

  parent: Draggable;
  imageUrl: string;

  // tslint:disable:member-ordering
  private constrainLocation: ConstrainLocationFunction = (x, y) => [x, y];
  private lastActivatedSoi: Planetoid;
  private destroy$ = new Subject<void>();

  constructor(public label: string,
              imageUrl: string,
              public moveType: MoveType) {
    this.imageUrl = imageUrl.startsWith('url(')
      ? imageUrl
      : `url(${imageUrl}) 0 0`;
  }

  toJson(): DraggableDto {
    return {
      label: this.label,
      location: this.location.toList(),
      lastAttemptLocation: this.lastAttemptLocation,
      children: this.children?.map(d => d.label),
      imageUrl: this.imageUrl,
      moveType: this.moveType,
      // parameterData: this.parameterData.toJson(),
    };
  }

  // TODO: destroy/dispose
  // this.isHover$.complete();
  // this.destroy$.next();
  // this.destroy$.complete();

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
      this.isGrabbing$.set(true);

      pointerStream = this.getEventObservable(screen, 'mousemove')
        .pipe(
          throttleTime(17),
          // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
          filter((move: MouseEvent) => move.buttons.bitwiseIncludes(1)),
          map((move: MouseEvent) => new Vector2(move.pageX, move.pageY)),
          finalize(() => {
            screen.style.cursor = 'unset';
            this.isGrabbing$.set(false);
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
        this.placeInSoiLock();
        updateCallback();
      }),
      takeUntil(this.destroy$))
      .subscribe(vector => {
        let xy = vector.toList();

        this.lastAttemptLocation = xy;
        this.setNewLocation(xy);
        this.showSoiUnderDraggable();
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

  setOrbit(orbit: Orbit) {
    this.orbit = orbit;
    this.parameterData.xy = this.parent?.parameterData?.xy ?? orbit.parameters.xy;
    this.parameterData.r = orbit.parameters.r;
  }

  private placeInSoiLock() {
    if (this.moveType !== 'soiLock' || !this.lastActivatedSoi) {
      return;
    }

    // TODO: remove UniverseContainerInstance usages
    UniverseContainerInstance.instance.planets$.value
      .map(cb => cb.draggable)
      .forEach(d => d.removeChild(this));

    this.lastActivatedSoi.showSoi = false;
    this.lastActivatedSoi.draggable.addChild(this);

    this.constrainLocation = LocationConstraints.soiLock(this.location, this.lastActivatedSoi.location);
    this.parent = this.lastActivatedSoi.draggable;

    this.lastActivatedSoi = undefined;
  }

  private showSoiUnderDraggable() {
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
    let draggables = spaceObjects.map(so => so.draggable);
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
