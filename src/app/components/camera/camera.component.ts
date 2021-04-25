import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Vector2 } from '../../common/domain/vector2';
import { fromEvent } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';
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

  updateScale(event: WheelEvent & { wheelDeltaY }) {
    let isTouchPad = event.wheelDeltaY
      ? Math.abs(event.wheelDeltaY) !== 120
      : event.deltaMode === 0;

    let zoomRatio = isTouchPad ? 1.05 : 1.25;
    let zoomDirection = -event.deltaY.sign();

    this.cameraService.zoomAt(zoomRatio * zoomDirection, new Vector2(event.x, event.y));
    window.requestAnimationFrame(() => this.cdr.markForCheck());
  }

  startMove(event: MouseEvent, screenSpace: HTMLDivElement) {
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

}
