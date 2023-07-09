import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ConnectionPositionPair,
  HorizontalConnectionPos,
  OriginConnectionPosition,
  OverlayConnectionPosition,
  OverlayModule,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActionOption } from '../../../common/domain/action-option';
import { Icons } from '../../../common/domain/icons';
import { ActionListComponent } from '../../action-list/action-list.component';

export type ActionPanelColors = 'green' | 'orange' | 'cosmic-blue';
export type Locations = 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right';

type OverlayPositions = OriginConnectionPosition['originX']
  | OriginConnectionPosition['originY']
  | OverlayConnectionPosition['overlayX']
  | OverlayConnectionPosition['overlayY']

@Component({
  selector: 'cp-action-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    ActionListComponent,
    OverlayModule,
  ],
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss'],
  animations: [
    // custom panel slide animation
    trigger('animateGrowIn', [
      transition('void => toptrue', [
        style({transform: 'translateY(-100%)', opacity: .3}),
        animate('.15s ease-out', style({transform: 'translateY(0)', opacity: 1})),
      ]),

      transition('toptrue => void', [
        style({transform: 'translateY(0)', opacity: 1}),
        animate('.4s ease-in', style({transform: 'translateY(-100%)', opacity: .3})),
      ]),

      transition('void => bottomtrue', [
        style({transform: 'translateY(100%)', opacity: .3}),
        animate('.15s ease-out', style({transform: 'translateY(0)', opacity: 1})),
      ]),

      transition('bottomtrue => void', [
        style({transform: 'translateY(0)', opacity: 1}),
        animate('.4s ease-in', style({transform: 'translateY(100%)', opacity: .3})),
      ]),
    ]),
  ],
})
export class ActionPanelComponent {
  @Input() set location(value: Locations) {
    this.positionStyle = value || 'top-left';
    this.positionConnection = this.getPositionConnection(this.positionStyle);
    if (!value) {
      return;
    }
    this.animationSide = value.includes('top') ? 'top' : 'bottom';
  }

  @Input() set options(value: ActionOption[]) {
    this.actionOptions = value;
    this.updateUnreadCount();
  }

  @Input() color: ActionPanelColors = 'green';
  @Input() icon: string = Icons.Hamburger;
  @Input() label?: string;

  actionOptions: ActionOption[];
  icons = Icons;
  unreadCount: number;
  isOpen = false;
  animationSide: 'top' | 'bottom' = 'top';

  positionStyle: Locations = 'top-left';
  positionConnection: ConnectionPositionPair[];

  close() {
    this.isOpen = false;
  }

  readNotification(actionOption: ActionOption) {
    actionOption.readNotification();
    this.updateUnreadCount();
  }

  updateUnreadCount() {
    this.unreadCount = this.actionOptions.count(ao => ao.unread);
  }

  private getPositionFromLocation(location: Locations): OverlayPositions[] {
    switch (location) {
      case 'top-left':
        return ['start', 'top', 'start', 'top'];
      case 'top-right':
        return ['end', 'top', 'end', 'top'];
      case 'bottom-left':
        return ['start', 'bottom', 'start', 'bottom'];
      case 'bottom-right':
        return ['end', 'bottom', 'end', 'bottom'];
      default:
        return this.getPositionFromLocation('top-left');
    }
  }

  private getPositionConnection(location: Locations) {
    let connectionProperties = this.getPositionFromLocation(location);
    let originX = connectionProperties[0] as HorizontalConnectionPos;
    let originY = connectionProperties[1] as VerticalConnectionPos;
    let overlayX = connectionProperties[2] as HorizontalConnectionPos;
    let overlayY = connectionProperties[3] as VerticalConnectionPos;

    return [
      new ConnectionPositionPair(
        {originX, originY},
        {overlayX, overlayY},
      ),
    ];
  }
}
