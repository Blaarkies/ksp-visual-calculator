import { Directive, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { mapTo, of, Subject, switchMap, timer } from 'rxjs';

@Directive({
  selector: '[cpMouseHover]',
})
export class MouseHoverDirective implements OnDestroy {

  @Output() hoverChange = new EventEmitter<boolean>();

  private hoverTrigger$ = new Subject<boolean>();

  constructor() {
    this.hoverTrigger$
      .pipe(
        switchMap(hover => hover
          ? of(true)
          : timer(1000).pipe(mapTo(false))))
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
