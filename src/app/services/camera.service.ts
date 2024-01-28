import {
  DestroyRef,
  Injectable,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { CameraDto } from '../common/domain/dtos/camera.dto';
import { Draggable } from '../common/domain/space-objects/draggable';
import { Planetoid } from '../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../common/domain/space-objects/planetoid-type';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';
import { Vector2 } from '../common/domain/vector2';
import { CameraMovement } from './domain/camera-movement.model';
import { StartCameraMovementParams } from './domain/start-camera-movement-params';

let defaultScale = 1;
let defaultLocation = new Vector2(-960, 540);

@Injectable({providedIn: 'root'})
export class CameraService {

  static zoomLimits = [1e-1, 2.1e3];
  static scaleToShowMoons = 25;

  /** Size of Backboard */
  static backboardScale = 1e4;
  /** Ratio from Gamespace locations to backboard normalized locations */
  static normalizedScale = 1e-11;

  private scaleModifier = CameraService.backboardScale * CameraService.normalizedScale;

  private hoverObject: Draggable;

  private _scale = defaultScale;

  get scale(): number {
    return this._scale;
  }

  private set scale(value: number) {
    let limitedValue = value.coerceIn(CameraService.zoomLimits[0], CameraService.zoomLimits[1]);
    this._scale = limitedValue;
  }

  private location = defaultLocation.clone();

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

  private cameraMove$ = new ReplaySubject<CameraMovement>();
  cameraMovement$ = this.cameraMove$.asObservable();

  // TODO: Set by CameraComponent onInit. Remove this hack
  getSoiParent: (location: Vector2) => Planetoid;

  constructor(
    private window: Window,
    destroyRef: DestroyRef,
  ) {
    destroyRef.onDestroy(() => this.cameraMove$.complete());
  }

  setFromJson(dto: CameraDto) {
    let location = Vector2.fromList(dto.location);
    this.startCameraMovement({newScale: dto.scale, newLocation: location});
  }

  toJson(): CameraDto {
    return {
      scale: this.scale.round(5),
      location: this.location.toList().map(v => v.round()),
    };
  }

  private focusAt(spaceObject: SpaceObject, zoomIn?: boolean) {
    let newScale = zoomIn
      ? CameraService.scaleToShowMoons.lerp(CameraService.zoomLimits[1], .999)
      : this.getScaleForFocus(spaceObject);

    let newLocation = spaceObject.location
      .multiplyClone(-newScale * this.scaleModifier)
      .addVector2(this.getScreenCenterOffset());

    this.startCameraMovement({newScale: newScale, newLocation: newLocation, focus: spaceObject});
  }

  focusSpaceObject(spaceObject: SpaceObject, zoomIn?: boolean) {
    this.lastFocusObject = spaceObject.draggable;
    this.focusAt(spaceObject, zoomIn);
  }

  private getScaleForFocus(spaceObject: SpaceObject) {
    if (spaceObject.type === SpaceObjectType.Craft) {
      return this.getScaleForCraft(spaceObject.location);
    }

    if (spaceObject instanceof Planetoid) {
      switch (spaceObject.planetoidType) {
        case PlanetoidType.Star:
          return CameraService.zoomLimits[0].lerp(CameraService.zoomLimits[1], .99997);
        case PlanetoidType.Planet:
          return defaultScale;
        case PlanetoidType.Moon:
          return CameraService.scaleToShowMoons.lerp(CameraService.zoomLimits[1], .9);
      }
    }

    return defaultScale;
  }

  private getScaleForCraft(newLocation: Vector2): number {
    let parent = this.getSoiParent(newLocation);
    return this.getScaleForFocus(parent);
  }

  translate(x: number, y: number) {
    this.startCameraMovement({newScale: this.scale, newLocation: this.location.clone().add(x, y), duration: 0});
  }

  /**
   * Find the ScreenSpace location matching `gameSpaceLocation`. This can find a
   * location in the camera's content-stack element matching a location in the
   * star system (i.e. displaying overlay icons).
   * <br>GameSpace is the "in-game" measure of location where SpaceObject Draggable(s) exist.
   * @param gameSpaceLocation Vector2 of a SpaceObject draggable
   * @see convertScreenToGameSpace
   */
  convertGameToScreenSpace(gameSpaceLocation: Vector2): Vector2 {
    let backboardLocation = gameSpaceLocation.clone().multiply(CameraService.normalizedScale);
    let screenSpaceLocation = backboardLocation.multiply(CameraService.backboardScale * this.scale);
    let screenSpaceLocationOffset = screenSpaceLocation.addVector2(this.location);
    return screenSpaceLocationOffset;
  };

  /**
   * Find the GameSpace location matching `screenSpaceLocation`. This can find a
   * location in the star system matching the camera location (i.e. placing craft at screen center).
   * <br>ScreenSpace is the measure of location on the Camera content-stack element.
   * <br>The following properties are affected by camera movement:
   * - width, height, left, top
   * @param screenSpaceLocation Vector2 of a camera location
   * @see convertGameToScreenSpace
   */
  convertScreenToGameSpace(screenSpaceLocation: Vector2): Vector2 {
    let backboardLocation = screenSpaceLocation.clone().subtractVector2(this.location);
    let backboardRatio = backboardLocation.multiply(1 / (CameraService.backboardScale * this.scale));
    let gameSpaceLocationOffset = backboardRatio.multiply(1 / CameraService.normalizedScale);
    return gameSpaceLocationOffset;
  }

  /**
   * Converts location from pageX/pageY properties found in a 'mousemove' event emitted from the
   * content-stack element to an on-screen location for displaying icons.
   * @param pageLocation Vector2 built from pageX/pageY properties
   */
  convertPageLocationToMouseLocation(pageLocation: Vector2): Vector2 {
    return pageLocation.subtractVector2(this.location);
  }

  /** Returns the GameSpace location found at the center of the screen. */
  getGameSpaceLocationOfScreenSpaceCenter(): Vector2 {
    return this.convertScreenToGameSpace(this.getScreenCenterOffset());
  }

  zoomAt(delta: number, mouseLocation: Vector2) {
    delta = delta > 0 ? delta : -1 / delta;

    let inRange = (this.scale * delta)
      .between(CameraService.zoomLimits[0], CameraService.zoomLimits[1]);
    if (!inRange) {
      return;
    }

    let hoverObject = this.currentHoverObject;
    let zoomAtLocation = hoverObject
      ? this.convertGameToScreenSpace(hoverObject.location)
      : mouseLocation;

    let worldLocation = zoomAtLocation.subtractVector2(this.location);
    let shift = worldLocation.multiply(-(delta - 1));

    let newLocation = this.location.clone().addVector2(shift);
    let newScale = this.scale * delta;

    this.startCameraMovement({newScale: newScale, newLocation: newLocation, duration: 150});
  }

  startCameraMovement(
    {
      newScale,
      newLocation,
      duration = 700,
      timingFunction = 'ease-out',
      focus,
    }: StartCameraMovementParams,
  ) {
    this.cameraMove$.next(
      new CameraMovement(newScale, newLocation.clone(),
        this.scale, this.location.clone(),
        duration, timingFunction,
        focus));

    this.updateCameraParameters(newScale, newLocation);
  }

  private updateCameraParameters(newScale: number, newLocation: Vector2) {
    this.scale = newScale;
    this.location.setVector2(newLocation);
  }

  private getScreenCenterOffset(): Vector2 {
    return new Vector2(this.window.innerWidth, this.window.innerHeight).multiply(.5);
  }

}
