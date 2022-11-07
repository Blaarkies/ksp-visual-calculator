import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Vector2 } from '../../../common/domain/vector2';
import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { SpaceObjectType } from '../../../common/domain/space-objects/space-object-type';
import { CameraComponent } from '../../../components/camera/camera.component';
import { finalize, fromEvent, interval, map, startWith, take, takeUntil } from 'rxjs';

@Component({
  selector: 'cp-relative-position-camera-test',
  templateUrl: './relative-position-camera-test.component.html',
  styleUrls: ['./relative-position-camera-test.component.scss']
})
export class RelativePositionCameraTestComponent implements OnInit {

  camera = {
    location: new Vector2(0, 0),
    scale: 1,
  };
  // body = new Vector2(0, 0);

  bodys = [
    new SpaceObject(50, 'purple', 'assets/stock/kerbol-system-icons/kerbol.png', 'freeMove', SpaceObjectType.Planet),
    new SpaceObject(20, 'green', 'assets/stock/kerbol-system-icons/kerbol.png', 'freeMove', SpaceObjectType.Planet),
    new SpaceObject(30, 'red', 'assets/stock/kerbol-system-icons/kerbol.png', 'freeMove', SpaceObjectType.Planet),
  ];

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.bodys[0].location.add(100);
    this.bodys[1].location.add(500);
    this.bodys[2].location.add(300, 100);
    this.updateUniverse();
  }

  startBodyDrag(body: SpaceObject, event: PointerEvent, screen: HTMLDivElement) {
    body.draggableHandle.startDrag(
      event,
      document.body as HTMLDivElement, () => this.updateUniverse(),
      this.camera as CameraComponent);
  }

  private updateUniverse() {
    window.requestAnimationFrame(() => this.cdr.markForCheck());
  }

  cameraMouseDown(event: MouseEvent, screenSpace: HTMLDivElement) {
    if (!event.buttons.bitwiseIncludes(2) && !event.buttons.bitwiseIncludes(1)) {
      return;
    }

    fromEvent(screenSpace, 'mousemove')
      .pipe(
        map((move: MouseEvent) => [move.movementX, move.movementY]),
        // finalize(() => screenStyle.transition = oldTransition),
        takeUntil(fromEvent(screenSpace, 'mouseleave')),
        takeUntil(fromEvent(screenSpace, 'mouseup')))
      .subscribe(([x, y]) => {
        this.camera.location.add(x, y);
        window.requestAnimationFrame(() => this.cdr.markForCheck());
      });
  }

  updateScale(event: WheelEvent) {
    let zoomDirection = -event.deltaY.sign();
    let delta = 1.05 * zoomDirection;
    delta = delta > 0 ? delta : -1 / delta;
    this.camera.scale *= delta;
    this.updateUniverse();

    // let isTouchPad = Math.abs(event.deltaY) < 25;
    // let zoomDirection = -event.deltaY.sign();

    // if (isTouchPad) {
    //   this.cameraService.zoomAt(1.05 * zoomDirection, new Vector2(event.x, event.y));
    //   window.requestAnimationFrame(() => this.cdr.markForCheck());
    // } else {
    //   interval(17)
    //     .pipe(startWith(0), take(5))
    //     .subscribe(() => {
    //       this.cameraService.zoomAt(1.05 * zoomDirection, new Vector2(event.x, event.y));
    //       window.requestAnimationFrame(() => this.cdr.markForCheck());
    //     });
    // }
  }

}
