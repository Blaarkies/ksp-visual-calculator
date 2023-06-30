import { OverlayContainer } from '@angular/cdk/overlay';
import {
  Inject,
  Injectable,
} from '@angular/core';
import {
  debounceTime,
  delay,
  fromEvent,
  merge,
  Observable,
} from 'rxjs';
import { Common } from '../common/common';
import { USER_IDLE_TIME } from '../common/token';

@Injectable({providedIn: 'root'})
export class EventService {

  /** Each observable has events that are staggered to avoid duplicate listener actions. */
  get userIdle$(): Observable<void> {
    return this.userIdleEvents$
      .pipe(delay(Common.randomInt(0, 200)));
  }

  private userIdleEvents$: Observable<void>;
  private readonly overlayContainer: HTMLElement;

  constructor(
    @Inject(USER_IDLE_TIME) idleDuration: number,
    window: Window,
    overlayRef: OverlayContainer,
  ) {
    this.userIdleEvents$ = merge(
      fromEvent(window, 'pointermove'),
      fromEvent(window, 'pointerdown'),
      fromEvent(window, 'keydown'),
    ).pipe(
      debounceTime(idleDuration),
    ) as unknown as Observable<void>;

    this.overlayContainer = overlayRef.getContainerElement();
  }

  hasActiveOverlay(): boolean {
    return this.overlayContainer.childElementCount !== 0;
  }


}
