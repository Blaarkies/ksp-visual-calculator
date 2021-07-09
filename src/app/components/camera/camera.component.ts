import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Vector2 } from '../../common/domain/vector2';
import { fromEvent } from 'rxjs';
import { filter, finalize, map, sampleTime, scan, skip, takeUntil, throttleTime } from 'rxjs/operators';
import { CameraService } from '../../services/camera.service';
import { WithDestroy } from '../../common/with-destroy';

@Component({
  selector: 'cp-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent extends WithDestroy() implements OnInit {

  @ViewChild('cameraController', {static: true}) cameraController: ElementRef<HTMLDivElement>;
  @ViewChild('screenSpace', {static: true}) screenSpace: ElementRef<HTMLDivElement>;

  get scale(): number {
    return this.cameraService?.scale;
  }

  get location(): Vector2 {
    return this.cameraService?.location ?? new Vector2();
  }

  cameraZoomLimits = CameraService.zoomLimits;
  scaleToShowMoons = CameraService.scaleToShowMoons;

  constructor(private cdr: ChangeDetectorRef,
              private cameraService: CameraService) {
    super();
  }

  ngOnInit() {
    this.cameraService.cdr = this.cdr;
    this.cameraService.cameraController = this.cameraController;
  }

  updateScale(event: WheelEvent) {
    let isTouchPad = Math.abs(event.deltaY) < 25;

    let zoomRatio = isTouchPad ? 1.05 : 1.25;
    let zoomDirection = -event.deltaY.sign();

    this.cameraService.zoomAt(zoomRatio * zoomDirection, new Vector2(event.x, event.y));
    window.requestAnimationFrame(() => this.cdr.markForCheck());
  }

  mouseDown(event: MouseEvent, screenSpace: HTMLDivElement) {
    if (!event.buttons.bitwiseIncludes(2)) {
      return;
    }

    // Remove the transition animation that causes lag when mouse-dragging the map around
    let screenStyle = this.screenSpace.nativeElement.style;
    let oldTransition = screenStyle.transition;
    screenStyle.transition = 'unset';

    fromEvent(screenSpace, 'mousemove')
      .pipe(
        map((move: MouseEvent) => [move.movementX, move.movementY]),
        finalize(() => screenStyle.transition = oldTransition),
        takeUntil(fromEvent(screenSpace, 'mouseleave')),
        takeUntil(fromEvent(screenSpace, 'mouseup')),
        takeUntil(this.destroy$))
      .subscribe(([x, y]) => {
        this.cameraService.location.add(x, y);
        window.requestAnimationFrame(() => this.cdr.markForCheck());
      });
  }

  touchStart(event: TouchEvent, screenSpace: HTMLDivElement) {
    let screenStyle = this.screenSpace.nativeElement.style;
    let oldTransition = screenStyle.transition;
    screenStyle.transition = 'unset';

    fromEvent(screenSpace, 'touchmove')
      .pipe(
        sampleTime(33),
        filter((touch: TouchEvent) => touch.changedTouches.length > 1),
        scan((acc, touch: TouchEvent) => {
          let locations = Array.from(touch.touches)
            .map(t => new Vector2(t.clientX, t.clientY));
          let meanLocation = locations.reduce((acc, v) => acc.addVector2(v), new Vector2())
            .multiply(1 / locations.length);
          let touchMeanDistance = locations.map(v => v.distance(meanLocation)).sum() / locations.length;

          acc.dxy = meanLocation.subtractVector2Clone(acc.lastLocation)
            .multiply(1 / locations.length);
          acc.lastLocation = meanLocation;

          acc.dz = (touchMeanDistance - acc.lastDistance) / acc.lastDistance;
          acc.lastDistance = touchMeanDistance;
          return acc;
        }, {dxy: undefined, dz: undefined, lastLocation: new Vector2(), lastDistance: 1}),
        skip(1),
        map(e => [e.dxy, e.dz, e.lastLocation]),
        finalize(() => screenStyle.transition = oldTransition),
        takeUntil(fromEvent(screenSpace, 'touchcancel')),
        takeUntil(fromEvent(screenSpace, 'touchend')),
        takeUntil(this.destroy$))
      .subscribe(([dxy, dz, location]: [Vector2, number, Vector2]) => {
        this.cameraService.zoomAt(1 + dz * .5, location.clone());
        this.cameraService.location.addVector2(dxy);
        window.requestAnimationFrame(() => this.cdr.markForCheck());
      });
  }

}
