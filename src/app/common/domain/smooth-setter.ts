import { interval, Subject } from 'rxjs';
import { map, startWith, take, takeUntil } from 'rxjs/operators';

export class SmoothSetter<T> {

  unsubscribe$ = new Subject();

  constructor(public value: T,
              private intervalTime: number,
              private steps: number,
              private setCallback?: (lerp: number, newValue: T, oldValue: T) => T,
              private doneCallback: () => void = () => void 0) {
    // todo: setup default setCallback based on T type
  }

  set(newValue: T) {
    this.unsubscribe$.next();

    interval(this.intervalTime)
      .pipe(
        take(this.steps - 1),
        map(i => i + 2),
        startWith(1),
        takeUntil(this.unsubscribe$))
      .subscribe(index => {
        this.value = this.setCallback(index / this.steps, newValue, this.value);
        this.doneCallback();
      });
  }

  destroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}

// todo: requestAnimationFrame to improve visual performance
// window.requestAnimationFrame(() => {
//   let val = `translate3D(${posX}px, ${posY}px, 0px) scale(${scale})`
//   node.style.transform = val
// })
