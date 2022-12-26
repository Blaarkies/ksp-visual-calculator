import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SpaceObjectService } from '../../services/space-object.service';
import { combineLatest, filter, fromEvent, take, takeUntil } from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { CameraService } from '../../services/camera.service';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { MatButton } from '@angular/material/button';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/event-logs';
import { ConfigurableAnimations } from '../../common/animations/configurable-animations';

interface FocusItem {
  icon: string;
  label: string;
  itemAction: () => void;
  source: any;
}

@Component({
  selector: 'cp-focus-jump-to-panel',
  templateUrl: './focus-jump-to-panel.component.html',
  styleUrls: ['./focus-jump-to-panel.component.scss'],
  animations: [ConfigurableAnimations.openCloseX(48)],
})
export class FocusJumpToPanelComponent extends WithDestroy() implements OnInit, OnDestroy {

  list: FocusItem[];
  isOpen = false;

  @ViewChildren('button') buttons: QueryList<MatButton>;

  constructor(spaceObjectService: SpaceObjectService,
              private cameraService: CameraService,
              private analyticsService: AnalyticsService) {
    super();

    let focusablesChange$ = combineLatest([
      spaceObjectService.crafts$,
      spaceObjectService.celestialBodies$])
      .pipe(filter(values => !values.some(v => v === null))); // filter null items out

    focusablesChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        this.list = values
          .flatMap()
          .map((so: SpaceObject) => ({
            icon: so.type.icon,
            label: so.label,
            itemAction: () => {
              this.analyticsService.logEventThrottled(EventLogs.Name.FocusBodyWithButton, {
                category: EventLogs.Category.Camera,
                body: EventLogs.Sanitize.anonymize(so.label),
              });

              cameraService.focusSpaceObject(so);
            },
            source: so,
          }));
      });

    focusablesChange$
      .pipe(
        take(1),
        takeUntil(this.destroy$))
      .subscribe(values => {
        // todo: modded/renamed universes might no longer have 'Kerbin'
        let kerbin = values.flatMap().find(so => so.label === 'Kerbin');
        cameraService.focusSpaceObject(kerbin);
      });
  }

  ngOnInit() {
    fromEvent(window, 'keyup')
      .pipe(
        filter((event: KeyboardEvent) => event.key === 'Tab'),
        takeUntil(this.destroy$))
      .subscribe(event => this.focusNextBody(event.shiftKey));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  private focusNextBody(shiftKey: boolean) {
    this.analyticsService.logEvent('Focus next body with keyboard', {
      category: EventLogs.Category.Camera,
      direction: shiftKey ? 'backward' : 'forward',
    });

    let lastDraggable = this.cameraService.lastFocusObject ?? this.list[0];
    let nextBodyIndex = this.list.findIndex(so =>
        (so.source as SpaceObject).draggableHandle === lastDraggable)
      + (shiftKey ? -1 : 1);
    let index = (nextBodyIndex + this.list.length) % this.list.length;
    let nextBody = this.list[index];
    nextBody.itemAction();

    let activeButton = this.buttons.get(index);
    let buttonElement = activeButton._elementRef.nativeElement;
    let parentNode = buttonElement.parentNode;

    parentNode.scrollTop = buttonElement.offsetTop
      + buttonElement.offsetHeight * .5
      - parentNode.offsetTop
      - parentNode.offsetHeight * .5;

    activeButton.ripple.launch({centered: true});
  }

}
