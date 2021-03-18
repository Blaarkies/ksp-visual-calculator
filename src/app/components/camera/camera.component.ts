import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Vector2 } from '../../common/domain/vector2';
import { fromEvent, Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { Camera } from '../../common/domain/camera';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit, OnDestroy {

  @Output() change = new EventEmitter<Camera>();

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
              public cameraService: CameraService /*todo: public for debug*/) {
  }

  ngOnInit() {
    this.cameraService._cdr = this._cdr;
    this.cameraService.cameraController = this.cameraController;
    this.cameraService.screenSpace = this.screenSpace;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    // this.camera.destroy();
  }

  updateScale(event: WheelEvent) {
    this.cameraService.addScale(-event.deltaY * .01, new Vector2(event.x, event.y));
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
