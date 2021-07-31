import { Directive, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, scan, skip } from 'rxjs/operators';

@Directive({
  selector: '[cpDoublePointerAction]',
})
export class DoublePointerActionDirective implements OnDestroy {

  @Output() doubleAction = new EventEmitter<PointerEvent>();

  private trigger$ = new Subject<PointerEvent>();

  constructor() {
    this.trigger$
      .pipe(
        scan((acc, value) => {
          let now = Date.now();
          acc.isDoubleAction = (now - acc.lastTime) < 300
            && !acc.isDoubleAction;
          acc.lastTime = now;
          acc.lastEvent = value;
          return acc;
        }, {lastTime: Date.now(), isDoubleAction: true, lastEvent: null}),
        skip(1),
        filter(({isDoubleAction}) => isDoubleAction))
      .subscribe(({lastEvent}) => this.doubleAction.emit(lastEvent));
  }

  @HostListener('pointerup', ['$event']) pointerUp(event: PointerEvent) {
    this.trigger$.next(event);
  }

  ngOnDestroy() {
    this.trigger$.complete();
  }

}
