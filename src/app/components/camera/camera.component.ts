import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Vector2 } from '../../common/domain/vector2';
import { fromEvent, Subject } from 'rxjs';
import { finalize, map, sampleTime, takeUntil } from 'rxjs/operators';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit, OnDestroy {

  @ViewChild('cameraController', {static: true}) cameraController: ElementRef<HTMLDivElement>;
  @ViewChild('screenSpace', {static: true}) screenSpace: ElementRef<HTMLDivElement>;

  private unsubscribe$ = new Subject();

  get scale(): number {
    return this.cameraService?.scale ?? 1;
  }

  get location(): Vector2 {
    return this.cameraService?.location ?? new Vector2();
  }

  constructor(private _cdr: ChangeDetectorRef,
              private cameraService: CameraService) {
  }

  ngOnInit() {
    this.cameraService._cdr = this._cdr;
    this.cameraService.cameraController = this.cameraController;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateScale(event: WheelEvent) {
    this.cameraService.zoomAt(-event.deltaY, new Vector2(event.x, event.y));
    this._cdr.markForCheck();
  }

  startMove(event: MouseEvent, screenSpace: HTMLDivElement) {
    if (!event.buttons.bitwiseIncludes(2)) {
      return;
    }

    // Transition animation causes lag when mouse-dragging the map around
    let screenStyle = this.screenSpace.nativeElement.style;
    let oldTransition = screenStyle.transition;
    screenStyle.transition = 'unset';

    fromEvent(screenSpace, 'mousemove')
      .pipe(
        map((move: MouseEvent) => [move.movementX, move.movementY]),
        finalize(() => screenStyle.transition = oldTransition),
        takeUntil(fromEvent(screenSpace, 'mouseleave')),
        takeUntil(fromEvent(screenSpace, 'mouseup')),
        takeUntil(this.unsubscribe$))
      .subscribe(([x, y]) => {
        this.cameraService.location.add(x, y);
        this._cdr.markForCheck();
      });
  }

}
