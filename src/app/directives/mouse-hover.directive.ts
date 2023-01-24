import { Directive, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { delay, of, Subject, switchMap } from 'rxjs';

@Directive({
  selector: '[cpMouseHover]',
})
export class MouseHoverDirective implements OnDestroy {

  @Input() set cpMouseHover(value: number | string) {
    let safeValue = Number(value);
    if (value === '' || (value !== 0 && isNaN(safeValue))) {
      return;
    }
    this.debounceDuration = safeValue;
  }

  @Output() hoverChange = new EventEmitter<boolean>();

  private debounceDuration = 1e3;
  private hoverTrigger$ = new Subject<boolean>();

  constructor() {
    this.hoverTrigger$
      .pipe(
        switchMap(hover => hover
          ? of(true)
          : of(false).pipe(delay(this.debounceDuration))))
      .subscribe(hover => this.hoverChange.emit(hover));
  }

  @HostListener('mouseenter') mouseOver() {
    this.hoverTrigger$.next(true);
  }

  @HostListener('mouseleave') mouseLeave() {
    this.hoverTrigger$.next(false);
  }

  ngOnDestroy() {
    this.hoverTrigger$.next(false);
    this.hoverTrigger$.complete();
  }

}
