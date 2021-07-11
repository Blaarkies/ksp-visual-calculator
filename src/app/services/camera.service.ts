import { ChangeDetectorRef, ElementRef, Injectable } from '@angular/core';
import { SmoothSetter } from '../common/domain/smooth-setter';
import { Vector2 } from '../common/domain/vector2';
import { Draggable } from '../common/domain/space-objects/draggable';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';

let defaultScale = 5e-8;
let defaultLocation = new Vector2(960, 540);

@Injectable({
  providedIn: 'root',
})
export class CameraService {

  static zoomLimits = [2e-9, 23e-5];
  static scaleToShowMoons = 2e-6;

  private scaleSmoothSetter = new SmoothSetter(defaultScale, 20, 1, // todo: use interval for animation effect
    (lerp, newValue, oldValue) => newValue.lerp(oldValue, lerp),
    () => this.cdr.markForCheck());

  get scale(): number {
    return this.scaleSmoothSetter.value;
  }

  set scale(value: number) {
    let limitedValue = value.coerceIn(CameraService.zoomLimits[0], CameraService.zoomLimits[1]);
    this.scaleSmoothSetter.set(limitedValue);
  }

  private locationSmoothSetter = new SmoothSetter(defaultLocation.clone(), 20, 1, // todo: use interval for animation effect
    (lerp, newValue, oldValue) => newValue.lerpClone(oldValue, lerp),
    () => this.cdr.markForCheck());

  get location(): Vector2 {
    return this.locationSmoothSetter.value;
  }

  set location(value: Vector2) {
    this.locationSmoothSetter.set(value);
  }

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

  // todo: change to proper setters, callbacks
  cdr: ChangeDetectorRef;
  cameraController: ElementRef<HTMLDivElement>;

  reset(scale?: number, location?: Vector2) {
    this.scaleSmoothSetter.value = scale ?? defaultScale;
    this.locationSmoothSetter.value = location ?? defaultLocation.clone();
    this.cdr.markForCheck();
  }

  zoomAt(delta: number, mouseLocation: Vector2 = null) {
    delta = delta > 0 ? delta : -1 / delta;

    if (!(this.scale * delta).between(
      CameraService.zoomLimits[0], CameraService.zoomLimits[1])) {
      return;
    }
    // zoom at hover objects, unless no object is currently hovered
    let zoomAtLocation = this.hoverObject
      ? this.hoverObject.location.clone().multiply(this.scale).addVector2(this.location)
      : mouseLocation;
    this.scale *= delta;

    let worldLocation = zoomAtLocation.add(-this.location.x, -this.location.y);
    let shift = worldLocation.multiply(-(delta - 1));

    this.location.addVector2(shift);
  }

  focusAt(newLocation: Vector2, type: SpaceObjectType, zoomIn?: boolean) {
    this.scale = zoomIn
      ? CameraService.scaleToShowMoons.lerp(CameraService.zoomLimits[1], .999)
      : this.getScaleForFocus(newLocation, type);

    this.location = newLocation.clone()
      .multiply(-this.scale)
      .addVector2(this.screenCenterOffset);
  }

  focusSpaceObject(spaceObject: SpaceObject, zoomIn?: boolean) {
    this.lastFocusObject = spaceObject.draggableHandle;
    this.focusAt(spaceObject.location, spaceObject.type, zoomIn);
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
    let spaceObjectContainerService = SpaceObjectContainerService.instance;
    let parent = spaceObjectContainerService.getSoiParent(newLocation);
    return this.getScaleForFocus(newLocation, parent.type);
  }

  destroy() {
    this.scaleSmoothSetter.destroy();
    this.locationSmoothSetter.destroy();
  }

}
