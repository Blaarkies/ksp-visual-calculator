import {
  ChangeDetectorRef,
  ElementRef,
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  ReplaySubject,
  take,
  timer,
} from 'rxjs';
import { CameraDto } from '../common/domain/dtos/camera.dto';
import { Draggable } from '../common/domain/space-objects/draggable';
import { Planetoid } from '../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../common/domain/space-objects/planetoid-type';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';
import { Vector2 } from '../common/domain/vector2';
import { easeOutExpo } from '../common/timing-functions';
import { WithDestroy } from '../common/with-destroy';

let defaultScale = 1;
let defaultLocation = new Vector2(960, 540);

@Injectable({providedIn: 'root'})
export class CameraService extends WithDestroy() implements OnDestroy {

  static zoomLimits = [1e-1, 1.9e3];
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
    return new Vector2(this.window.innerWidth, this.window.innerHeight).multiply(.5);
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
  cameraController: ElementRef<HTMLDivElement>;
  contentStack: ElementRef<HTMLDivElement>;
  getSoiParent: (location: Vector2) => Planetoid;

  constructor(private window: Window) {
    super();
  }

  setFromJson(dto: CameraDto) {
    let startScale = this.scale;
    let startLocation = this.location.clone();
    let endLocation = Vector2.fromList(dto.location);
    let intervalDuration = 10;
    let totalDuration = 1000;
    let steps = (totalDuration / intervalDuration).toInt();

    timer(0, intervalDuration).pipe(take(steps))
      .subscribe(i => {
        let t = (i + 1) / steps;
        let tw = easeOutExpo(t);
        let newScale = dto.scale.lerp(startScale, tw);
        let newLocation = endLocation.lerpClone(startLocation, tw);
        this.scale = newScale;
        this.location.setVector2(newLocation);

        this.cameraChange$.next();
      });
  }

  toJson(): CameraDto {
    return {
      scale: this.scale.round(5),
      location: this.location.toList().map(v => v.round()),
    };
  }

  reset(scale?: number, location?: Vector2) {
    this._scale = scale ?? defaultScale;
    this.location = location ?? defaultLocation.clone();
    this.cameraChange$.next();
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

  private focusAt(spaceObject: SpaceObject, zoomIn?: boolean) {
    this.scale = zoomIn
      ? CameraService.scaleToShowMoons.lerp(CameraService.zoomLimits[1], .999)
      : this.getScaleForFocus(spaceObject);

    this.location = spaceObject.location.clone()
      .multiply(-this.scale * CameraService.scaleModifier)
      .addVector2(this.screenCenterOffset);

    this.cameraChange$.next();
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
    this.location.add(x, y);
    this.cameraChange$.next();
  }

  convertGameToScreenSpace(gameSpaceLocation: Vector2): Vector2 {
    let backboardLocation = gameSpaceLocation.clone().multiply(CameraService.normalizedScale);
    let screenSpaceLocation = backboardLocation.multiply(CameraService.backboardScale * this.scale);
    let screenSpaceLocationOffset = screenSpaceLocation.addVector2(this.location);
    return screenSpaceLocationOffset;
  };

  convertScreenToGameSpace(screenSpaceLocation: Vector2): Vector2 {
    let backboardLocation = screenSpaceLocation.clone().subtractVector2(this.location);
    let backboardRatio = backboardLocation.multiply(1 / (CameraService.backboardScale * this.scale));
    let gameSpaceLocationOffset = backboardRatio.multiply(1 / CameraService.normalizedScale);
    return gameSpaceLocationOffset;
  }

}
