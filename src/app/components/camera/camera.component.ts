import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Vector2 } from '../../common/domain/vector2';
import { fromEvent, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Camera } from '../../common/domain/camera';

@Component({
  selector: 'cp-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit, OnDestroy {

  @Output() change = new EventEmitter<Camera>();

  @ViewChild('cameraController', {static: true}) cameraController: ElementRef<HTMLDivElement>;
  @ViewChild('screenSpace', {static: true}) screenSpace: ElementRef<HTMLDivElement>;

  camera: Camera;
  private unsubscribe$ = new Subject();

  get scale(): number {
    return this.camera?.scale ?? 1;
  }

  get location(): Vector2 {
    return this.camera?.location ?? new Vector2();
  }

  constructor(private _cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.camera = new Camera(this._cdr, this.cameraController, this.screenSpace);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.camera.destroy();
  }

  updateScale(event: WheelEvent) {
    this.camera.addScale(-event.deltaY * .01, new Vector2(event.x, event.y));
    this._cdr.markForCheck();
  }

  startMove(event: MouseEvent, screenSpace: HTMLDivElement) {
    if (!event.buttons.bitwiseIncludes(2)) {
      return;
    }

    fromEvent(screenSpace, 'mousemove')
      .pipe(
        map((move: MouseEvent) => [move.movementX, move.movementY]),
        takeUntil(fromEvent(screenSpace, 'mouseleave')),
        takeUntil(fromEvent(screenSpace, 'mouseup')),
        takeUntil(this.unsubscribe$))
      .subscribe(([x, y]) => {
        this.camera.location.add(x, y);
        this._cdr.markForCheck();
      });
  }

}
