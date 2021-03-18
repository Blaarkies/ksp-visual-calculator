import { Vector2 } from './vector2';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { SmoothSetter } from './smooth-setter';

export class Camera {
  //
  // private scaleSmoothSetter = new SmoothSetter(1, 20, 5,
  //   (lerp, newValue, oldValue) => newValue.lerp(oldValue, lerp),
  //   () => this._cdr.markForCheck());
  //
  // get scale(): number {
  //   return this.scaleSmoothSetter.value;
  // }
  //
  // set scale(value: number) {
  //   let limitedValue = value.coerceIn(.1, 10);
  //   this.scaleSmoothSetter.set(limitedValue);
  // }
  //
  //
  // private locationSmoothSetter = new SmoothSetter(new Vector2(0, 0), 20, 5,
  //   (lerp, newValue, oldValue) => newValue.lerpClone(oldValue, lerp),
  //   () => this._cdr.detectChanges());
  //
  // get location(): Vector2 {
  //   return this.locationSmoothSetter.value;
  // }
  //
  // set location(value: Vector2) {
  //   this.locationSmoothSetter.set(value);
  // }
  //
  //
  // get screenCenterOffset(): Vector2 {
  //   let element = this.cameraController.nativeElement;
  //   return new Vector2(element.offsetWidth * .5, element.offsetHeight * .5);
  // }
  //
  // get screenSize(): Vector2 {
  //   let element = this.cameraController.nativeElement;
  //   return new Vector2(element.offsetWidth, element.offsetHeight);
  // }
  //
  // get screenSpaceSize(): Vector2 {
  //   let element = this.screenSpace.nativeElement;
  //   return new Vector2(element.offsetWidth, element.offsetHeight);
  // }
  //
  // constructor(private _cdr: ChangeDetectorRef,
  //             private cameraController: ElementRef<HTMLDivElement>,
  //             private screenSpace: ElementRef<HTMLDivElement>) {
  // }
  //
  // addScale(delta: number, mouseLocation: Vector2 = null) {
  //   if (!(this.scale + delta).between(.1, 10)) { // todo: connect this with scale setter
  //     return;
  //   }
  //   let scaleRatio = (delta + this.scale) / this.scale;
  //
  //   let screenSize = this.screenSize;
  //   let nowSize = screenSize.clone().multiply(this.scale);
  //
  //   let nowDiff = nowSize.clone().multiply(1 - scaleRatio);
  //
  //   let locationRatio = new Vector2(.5, .5)
  //   // new Vector2(-this.location.x / screenSize.x, -this.location.y / screenSize.y)
  //   //   .addVector2(
  //   //   new Vector2(.5, .5)
  //   // );
  //   let movement = nowDiff.clone().multiplyVector2(locationRatio);
  //
  //   // console.log(
  //   //   // nowSize,
  //   //   // nowDiff,
  //   //   movement,
  //   //   locationRatio,
  //   // );
  //
  //   this.location = this.location.clone()
  //     .addVector2(movement);
  //
  //
  //   this.scale += delta;
  // }
  //
  // destroy() {
  //   this.scaleSmoothSetter.destroy();
  //   this.locationSmoothSetter.destroy();
  // }

}
