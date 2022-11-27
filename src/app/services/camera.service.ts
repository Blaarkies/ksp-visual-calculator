import { ChangeDetectorRef, ElementRef, Injectable } from '@angular/core';
import { SmoothSetter } from '../common/domain/smooth-setter';
import { Vector2 } from '../common/domain/vector2';
import { Draggable } from '../common/domain/space-objects/draggable';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';

let defaultScale = 1;
let defaultLocation = new Vector2(960, 540);

@Injectable({
  providedIn: 'root',
})
export class CameraService {

  static zoomLimits = [.1, 2e3];
  static scaleToShowMoons = 25;

  /** Size of Backboard */
  static backboardScale = 1e4;
  /** Ratio from Gamespace locations to backboard normalized locations */
  static normalizedScale = 1e-11;
  static scaleModifier = CameraService.backboardScale * CameraService.normalizedScale;

  private scaleSmoothSetter = defaultScale;
  // new SmoothSetter(defaultScale, 20, 1, // todo: use interval for animation effect
  // (lerp, newValue, oldValue) => newValue.lerp(oldValue, lerp),
  // () => this.cdr.markForCheck());

  get scale(): number {
    // return this.scaleSmoothSetter.value;
    return this.scaleSmoothSetter;
  }

  set scale(value: number) {
    let limitedValue = value.coerceIn(CameraService.zoomLimits[0], CameraService.zoomLimits[1]);
    this.scaleSmoothSetter = limitedValue;
  }

  private locationSmoothSetter = defaultLocation.clone();
  // new SmoothSetter(defaultLocation.clone(), 20, 1, // todo: use interval for animation effect
  // (lerp, newValue, oldValue) => newValue.lerpClone(oldValue, lerp),
  // () => this.cdr.markForCheck());

  get location(): Vector2 {
    // return this.locationSmoothSetter.value;
    return this.locationSmoothSetter;
  }

  set location(value: Vector2) {
    this.locationSmoothSetter = value;
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
    this.scaleSmoothSetter = scale ?? defaultScale;
    this.locationSmoothSetter = location ?? defaultLocation.clone();
    this.cdr.markForCheck();
  }

  zoomAt(delta: number, mouseLocation: Vector2 = null) {
    delta = delta > 0 ? delta : -1 / delta;

    let outOfRange = !(this.scale * delta)
      .between(CameraService.zoomLimits[0], CameraService.zoomLimits[1]);
    if (outOfRange) {
      return;
    }

    this.scale *= delta;
    let zoomAtLocation = this.hoverObject
      ? this.getScreenLocationOfHoverObject()
      : mouseLocation;

    // TODO: zoom at hoverObject locations misses the target
    // console.log('mouseLocation', mouseLocation)
    // console.log('hoverObject', this.hoverObject?.location?.clone()
    //   ?.multiply(this.scale * CameraService.scaleModifier)
    //   ?.addVector2(this.location))

    let worldLocation = zoomAtLocation.subtractVector2(this.location);
    let shift = worldLocation.multiply(-(delta - 1));

    this.location.addVector2(shift);
  }

  // TODO: remove with game -> screenspace conversion fix
  hoverObjectElement: {name?, element?} = {};
  private getScreenLocationOfHoverObject() {
    // TODO: use proper game -> screenspace conversion
    let shouldUpdate = this.hoverObjectElement.name !== this.hoverObject.label
      || !this.hoverObjectElement.element;
    this.hoverObjectElement = shouldUpdate
      ? {
        name: this.hoverObject.label,
        element: Array.from(document.querySelectorAll('div .draggable-body'))
          .find(e => e.innerHTML.includes(this.hoverObject.label)),
      }
      : this.hoverObjectElement;
    let rect = this.hoverObjectElement.element
      .getBoundingClientRect();
    return new Vector2(rect.x, rect.y);
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
    // this.scaleSmoothSetter.destroy();
    // this.locationSmoothSetter.destroy();
  }

  translate(x: number, y: number) {
    this.location.add(x, y);
  }
}
