import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  filter,
  fromEvent,
  takeUntil,
} from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { CameraService } from '../../services/camera.service';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import {
  MatButton,
  MatButtonModule,
} from '@angular/material/button';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/domain/event-logs';
import { ConfigurableAnimations } from '../../animations/configurable-animations';
import { CommonModule } from '@angular/common';
import { MouseHoverDirective } from '../../directives/mouse-hover.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

interface FocusItem {
  icon: string;
  label: string;
  itemAction: () => void;
  source: any;
}

@Component({
  selector: 'cp-focus-jump-to-panel',
  standalone: true,
  imports: [
    CommonModule,
    MouseHoverDirective,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './focus-jump-to-panel.component.html',
  styleUrls: ['./focus-jump-to-panel.component.scss'],
  animations: [ConfigurableAnimations.openCloseX(48)],
})
export class FocusJumpToPanelComponent extends WithDestroy() implements OnInit, OnDestroy {

  @Input() set focusables(value: SpaceObject[]) {
    this.list = this.getActionPrimedList(value);

    if (!this.hasFocusablesBeenSet && this.list?.length) {
      // TODO: modded/renamed universes might no longer have 'Kerbin'
      let kerbin = value.find(so => so.label === 'Kerbin');
      this.cameraService.focusSpaceObject(kerbin);

      this.hasFocusablesBeenSet = true;
    }
  }

  private getActionPrimedList(value: SpaceObject[]) {
    return value?.map((so: SpaceObject) => ({
      icon: so.type.icon,
      label: so.label,
      itemAction: () => {
        this.analyticsService.logEventThrottled(EventLogs.Name.FocusBodyWithButton, {
          category: EventLogs.Category.Camera,
          body: EventLogs.Sanitize.anonymize(so.label),
        });

        this.cameraService.focusSpaceObject(so);
      },
      source: so,
    }));
  }

  list: FocusItem[];
  isOpen = false;

  private hasFocusablesBeenSet = false;

  @ViewChildren('button') buttons: QueryList<MatButton>;

  constructor(private cameraService: CameraService,
              private analyticsService: AnalyticsService) {
    super();
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
