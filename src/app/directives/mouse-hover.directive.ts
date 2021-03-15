import { Directive, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { of, Subject, timer } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';

@Directive({
  selector: '[cpMousehover]',
})
export class MouseHoverDirective implements OnDestroy {

  @Output() hoverChange = new EventEmitter<boolean>();

  private hoverTrigger$ = new Subject<boolean>();

  constructor() {
    this.hoverTrigger$
      .pipe(
        switchMap(hover => hover
          ? of(hover)
          : timer(1000).pipe(mapTo(hover))))
      .subscribe(hover => this.hoverChange.emit(hover));
  }

  @HostListener('mouseenter') mouseover() {
    this.hoverTrigger$.next(true);
  }

  @HostListener('mouseleave') mouseleave() {
    this.hoverTrigger$.next(false);
  }

  ngOnDestroy() {
    this.hoverTrigger$.next();
    this.hoverTrigger$.complete();
  }

}
