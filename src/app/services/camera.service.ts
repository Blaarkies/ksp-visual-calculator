import { ChangeDetectorRef, ElementRef, Injectable } from '@angular/core';
import { Vector2 } from '../common/domain/vector2';
import { Draggable } from '../common/domain/space-objects/draggable';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { UniverseContainerInstance } from './universe-container-instance.service';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';
import { ReplaySubject } from 'rxjs';

let defaultScale = 1;
let defaultLocation = new Vector2(960, 540);

@Injectable({
  providedIn: 'root',
})
export class CameraService {

  static zoomLimits = [.1, 1.9e3];
  static scaleToShowMoons = 25;

  /** Size of Backboard */
  static backboardScale = 1e4;
  /** Ratio from Gamespace locations to backboard normalized locations */
  static normalizedScale = 1e-11;
  static scaleModifier = CameraService.backboardScale * CameraService.normalizedScale;

  private _scale = defaultScale;
  get scale(): number {
    return this._scale;
  }

  set scale(value: number) {
    let limitedValue = value.coerceIn(CameraService.zoomLimits[0], CameraService.zoomLimits[1]);
    this._scale = limitedValue;
  }

  location = defaultLocation.clone();

  get screenCenterOffset(): Vector2 {
    return new Vector2(window.innerWidth, window.innerHeight).multiply(.5);
  }

  get screenSize(): Vector2 {
    return new Vector2(window.innerWidth, window.innerHeight);
  }

  private hoverObject: Draggable;

  get currentHoverObject(): Draggable {
    return this.hoverObject;
  }

  set currentHoverObject(value: Draggable) {
    this.hoverObject = value;
    if (value) {
      this.lastFocusObject = value;
    }
  }

  lastFocusObject: Draggable;
  cameraChange$ = new ReplaySubject<void>();

  // TODO: change to proper setters, callbacks
  cdr: ChangeDetectorRef;
  cameraController: ElementRef<HTMLDivElement>;

  reset(scale?: number, location?: Vector2) {
    this._scale = scale ?? defaultScale;
    this.location = location ?? defaultLocation.clone();
    this.cdr.markForCheck();
  }

  zoomAt(delta: number, mouseLocation: Vector2 = null) {
    delta = delta > 0 ? delta : -1 / delta;

    let inRange = (this.scale * delta).between(CameraService.zoomLimits[0], CameraService.zoomLimits[1]);
    if (!inRange) {
      return;
    }

    let zoomAtLocation = this.hoverObject
      ? this.convertGameToScreenSpace(this.hoverObject.location)
      : mouseLocation;

    let worldLocation = zoomAtLocation.subtractVector2(this.location);
    let shift = worldLocation.multiply(-(delta - 1));

    this.location.addVector2(shift);
    this.scale *= delta;

    this.cameraChange$.next();
  }

  private focusAt(newLocation: Vector2, type: SpaceObjectType, zoomIn?: boolean) {
    this.scale = zoomIn
      ? CameraService.scaleToShowMoons.lerp(CameraService.zoomLimits[1], .999)
      : this.getScaleForFocus(newLocation, type);

    this.location = newLocation.clone()
      .multiply(-this.scale * CameraService.scaleModifier)
      .addVector2(this.screenCenterOffset);
  }

  focusSpaceObject(spaceObject: SpaceObject, zoomIn?: boolean) {
    this.lastFocusObject = spaceObject.draggableHandle;
    this.focusAt(spaceObject.location, spaceObject.type, zoomIn);
    this.cdr.markForCheck();

    this.cameraChange$.next();
  }

  private getScaleForFocus(location: Vector2, type: SpaceObjectType) {
    switch (type) {
      case SpaceObjectType.Star:
        return CameraService.zoomLimits[0].lerp(CameraService.zoomLimits[1], .99997);
      case SpaceObjectType.Planet:
        return defaultScale;
      case SpaceObjectType.Moon:
        return CameraService.scaleToShowMoons.lerp(CameraService.zoomLimits[1], .9);
      case SpaceObjectType.Craft:
        return this.getScaleForCraft(location);
      default:
        return defaultScale;
    }
  }

  private getScaleForCraft(newLocation: Vector2): number {
    let spaceObjectContainerService = UniverseContainerInstance.instance;
    let parent = spaceObjectContainerService.getSoiParent(newLocation);
    return this.getScaleForFocus(newLocation, parent.type);
  }

  translate(x: number, y: number) {
    this.location.add(x, y);
  }

  convertGameToScreenSpace(gameSpaceLocation: Vector2): Vector2 {
    let backboardLocation = gameSpaceLocation.clone().multiply(CameraService.normalizedScale);
    let screenSpaceLocation = backboardLocation.multiply(CameraService.backboardScale * this.scale);
    let screenSpaceLocationOffset = screenSpaceLocation.addVector2(this.location);
    return screenSpaceLocationOffset;
  };

  convertScreenToGameSpace(screenSpaceLocation: Vector2): Vector2 {
    let backboardLocation = screenSpaceLocation.clone().subtractVector2(this.location);
    let backboardRatio = backboardLocation.multiply(1/(CameraService.backboardScale*this.scale));
    let gameSpaceLocationOffset = backboardRatio.multiply(1/CameraService.normalizedScale);
    return gameSpaceLocationOffset;
  }

}
