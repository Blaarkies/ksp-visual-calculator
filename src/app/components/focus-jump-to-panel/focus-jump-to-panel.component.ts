import {
  Component,
  DestroyRef,
  effect,
  Input,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  MatButton,
  MatButtonModule,
} from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  firstValueFrom,
  fromEvent,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';
import { ConfigurableAnimations } from '../../animations/configurable-animations';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { MouseHoverDirective } from '../../directives/mouse-hover.directive';
import { AnalyticsService } from '../../services/analytics.service';
import { CameraService } from '../../services/camera.service';
import { EventLogs } from '../../services/domain/event-logs';
import { EventService } from '../../services/event.service';

interface FocusItem {
  icon: string;
  label: string;
  itemAction: () => void;
  source: SpaceObject;
  isSelected: boolean;
}

@Component({
  selector: 'cp-focus-jump-to-panel',
  standalone: true,
  imports: [
    MouseHoverDirective,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatRippleModule,
  ],
  templateUrl: './focus-jump-to-panel.component.html',
  styleUrls: ['./focus-jump-to-panel.component.scss'],
  animations: [ConfigurableAnimations.openCloseX(48)],
})
export class FocusJumpToPanelComponent {

  @Input() set focusables(value: SpaceObject[]) {
    this.list = this.getActionPrimedList(value);
    this.listSig.set(this.list);
  }

  private list: FocusItem[];
  listSig = signal<FocusItem[]>([]);

  private isOpen$ = new BehaviorSubject<boolean>(false);
  isOpenSig = toSignal(this.isOpen$);

  @ViewChildren('button') buttons: QueryList<MatButton>;

  private lastFocused: FocusItem;
  private isAvailableForClick$ = this.isOpen$.pipe(
    // prevents touch taps while panel is closed (touchscreens have no hover ability)
    switchMap(isOpen =>
      timer(isOpen ? 100 : 0).pipe(
        map(() => isOpen))),
    startWith(false),
    shareReplay(1));

  constructor(
    private cameraService: CameraService,
    private analyticsService: AnalyticsService,
    private window: Window,
    private eventService: EventService,
    private destroyRef: DestroyRef,
  ) {
    destroyRef.onDestroy(() => this.isOpen$.complete());

    effect(() =>
      fromEvent(this.window, 'keyup')
        .pipe(
          filter((event: KeyboardEvent) => event.key === 'Tab'
            && !this.eventService.hasActiveOverlay()),
          tap(event => {
            this.focusNextBody(event.shiftKey);
            event.preventDefault();
          }),
          takeUntilDestroyed(destroyRef))
        .subscribe());

    cameraService.cameraMovement$.pipe(
      debounceTime(500),
      takeUntilDestroyed())
      .subscribe(cm => {
        if (this.lastFocused) {
          this.lastFocused.isSelected = false;
        }
        if (cm.focus) {
          this.updateLastFocused(cm.focus);
          return;
        }

        let spaceObject = cameraService.getSoiParent(
          cameraService.getGameSpaceLocationOfScreenSpaceCenter());
        if (spaceObject) {
          this.updateLastFocused(spaceObject);
        }
      });
  }

  setIsOpen(event: boolean) {
    this.isOpen$.next(event);
  }

  private updateLastFocused(spaceObject: SpaceObject) {
    let newFocus = this.list.find(fi => fi.source === spaceObject);
    this.lastFocused = newFocus;
    this.lastFocused.isSelected = true;

    this.scrollToButton(this.list.indexOf(newFocus));
  }

  private getActionPrimedList(value: SpaceObject[]) {
    let list = value?.map((so: SpaceObject) => ({
      icon: so instanceof Planetoid
        ? so.planetoidType.icon
        : so.type.icon,
      label: so.label,
      itemAction: async () => {
        let canClick$ = this.isAvailableForClick$.pipe(
          take(1),
          takeUntilDestroyed(this.destroyRef));
        let canClick = await firstValueFrom(canClick$);
        if (!canClick) {
          return;
        }

        this.analyticsService.logEventThrottled(EventLogs.Name.FocusBodyWithButton, {
          category: EventLogs.Category.Camera,
          body: EventLogs.Sanitize.anonymize(so.label),
        });

        this.cameraService.focusSpaceObject(so);
        if (this.lastFocused) {
          this.lastFocused.isSelected = false;
        }
        let thisItem = list.find(fi => fi.source === so);
        thisItem.isSelected = true;
        this.lastFocused = thisItem;
      },
      source: so,
      isSelected: false,
    }));

    return list;
  }

  private focusNextBody(shiftKey: boolean) {
    this.analyticsService.logEvent('Focus next body with keyboard', {
      category: EventLogs.Category.Camera,
      direction: shiftKey ? 'backward' : 'forward',
    });

    let lastFocused = this.lastFocused ?? this.list[0];
    let nextBodyIndex = this.list.findIndex(fi => fi === lastFocused)
      + (shiftKey ? -1 : 1);
    let index = (nextBodyIndex + this.list.length) % this.list.length;
    let nextFocusItem = this.list[index];
    nextFocusItem.itemAction();

    this.scrollToButton(index);
  }

  private scrollToButton(index: number) {
    let activeButton = this.buttons.get(index);
    let buttonElement = activeButton._elementRef.nativeElement;
    let parentNode = buttonElement.parentNode;

    parentNode.scrollTop = buttonElement.offsetTop
      + buttonElement.offsetHeight * .5
      - parentNode.offsetTop
      - parentNode.offsetHeight * .5;
  }

}
