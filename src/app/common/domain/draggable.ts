import { fromEvent } from 'rxjs';
import { filter, finalize, map, takeUntil, throttleTime } from 'rxjs/operators';
import { ConstrainLocationFunction } from './constrain-location-function';
import { Vector2 } from './vector2';
import { CameraComponent } from '../../components/camera/camera.component';

export class Draggable {

  isGrabbing: boolean;
  location = new Vector2();

  constructor(public label: string,
              public imageUrl: string,
              public constrainLocation: ConstrainLocationFunction
                = (x, y) => [x, y]) {
    this.setNewLocation();
  }

  startDrag(event: MouseEvent,
            screen: HTMLDivElement,
            updateCallback: () => void = () => void 0,
            camera?: CameraComponent) {
    screen.style.cursor = 'grabbing';
    this.isGrabbing = true;
    updateCallback();

    fromEvent(screen, 'mousemove')
      .pipe(
        throttleTime(25),
        // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
        filter((move: MouseEvent) => move.buttons.bitwiseIncludes(1)),
        map((move: MouseEvent) => [move.pageX - camera.location.x, move.pageY - camera.location.y]),
        map(pair => camera
          ? [pair[0] / camera.scale, pair[1] / camera.scale]
          : pair),
        finalize(() => {
          screen.style.cursor = 'unset';
          this.isGrabbing = false;
          updateCallback();
        }),
        takeUntil(fromEvent(screen, 'mouseleave')),
        takeUntil(fromEvent(event.target, 'mouseup')),
        takeUntil(fromEvent(screen, 'mouseup')))
      .subscribe(([x, y]) => {
        this.setNewLocation(x, y);
        updateCallback();
      });
  }

  private setNewLocation(x: number = null, y: number = null) {
    this.location.set(this.constrainLocation(x, y));
  }

}
