import { fromEvent } from 'rxjs';
import { finalize, map, takeUntil, throttleTime } from 'rxjs/operators';
import { ConstrainLocationFunction } from './constrain-location-function';

export class Draggable {

  isGrabbing: boolean;
  x: number;
  y: number;

  constructor(public label: string,
              public imageUrl: string,
              public constrainLocation: ConstrainLocationFunction
                = (x, y) => [x, y]) {
    this.setNewLocation();
  }

  startDrag(event: MouseEvent, screen: HTMLDivElement) {
    screen.style.cursor = 'grabbing';
    this.isGrabbing = true;

    fromEvent(screen, 'mousemove')
      .pipe(
        throttleTime(33),
        map((move: MouseEvent) => [move.pageX, move.pageY]),
        finalize(() => {
          screen.style.cursor = 'unset';
          this.isGrabbing = false;
        }),
        takeUntil(fromEvent(screen, 'mouseleave')),
        takeUntil(fromEvent(event.target, 'mouseup')),
        takeUntil(fromEvent(screen, 'mouseup')))
      .subscribe(([x, y]) => this.setNewLocation(x, y));
  }

  private setNewLocation(x: number = null, y: number = null) {
    [this.x, this.y] = this.constrainLocation(x, y);
  }

}
