import { ChangeDetectorRef, ElementRef, Injectable } from '@angular/core';
import { SmoothSetter } from '../common/domain/smooth-setter';
import { Vector2 } from '../common/domain/vector2';

let defaultScale = 5e-8;
let defaultLocation = new Vector2(960, 540);

@Injectable({
  providedIn: 'root',
})
export class CameraService {

  private static zoomLimits = [2e-9, 23e-5];

  private scaleSmoothSetter = new SmoothSetter(defaultScale, 20, 1, // todo: use interval for animation effect
    (lerp, newValue, oldValue) => newValue.lerp(oldValue, lerp),
    () => this._cdr.markForCheck());

  get scale(): number {
    return this.scaleSmoothSetter.value;
  }

  set scale(value: number) {
    let limitedValue = value.coerceIn(CameraService.zoomLimits[0], CameraService.zoomLimits[1]);
    this.scaleSmoothSetter.set(limitedValue);
  }

  private locationSmoothSetter = new SmoothSetter(defaultLocation.clone(), 20, 1, // todo: use interval for animation effect
    (lerp, newValue, oldValue) => newValue.lerpClone(oldValue, lerp),
    () => this._cdr.markForCheck());

  get location(): Vector2 {
    return this.locationSmoothSetter.value;
  }

  set location(value: Vector2) {
    this.locationSmoothSetter.set(value);
  }

  get screenCenterOffset(): Vector2 {
    let element = this.cameraController.nativeElement;
    return new Vector2(element.offsetWidth * .5, element.offsetHeight * .5);
  }

  get screenSize(): Vector2 {
    let element = this.cameraController.nativeElement;
    return new Vector2(element.offsetWidth, element.offsetHeight);
  }

  // todo: change to proper setters, callbacks
  _cdr: ChangeDetectorRef;
  cameraController: ElementRef<HTMLDivElement>;

  reset(scale?: number, location?: Vector2) {
    this.scaleSmoothSetter.value = scale ?? defaultScale;
    this.locationSmoothSetter.value = location ?? defaultLocation.clone();
  }

  zoomAt(delta: number, mouseLocation: Vector2 = null) {
    delta = delta > 0 ? 1.4 : 1 / 1.4;

    if (!(this.scale * delta).between(
      CameraService.zoomLimits[0], CameraService.zoomLimits[1])) {
      return;
    }
    this.scale *= delta;

    let worldLocation = mouseLocation.add(-this.location.x, -this.location.y);
    let shift = worldLocation.multiply(-(delta - 1));

    this.location.addVector2(shift);
  }

  destroy() {
    this.scaleSmoothSetter.destroy();
    this.locationSmoothSetter.destroy();
  }

}
