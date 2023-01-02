import { Component, Input } from '@angular/core';
import { Icons } from '../../common/domain/icons';
import { ActionOption } from '../../common/domain/action-option';
import { fromEvent, take, takeUntil } from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { BasicAnimations } from '../../common/animations/basic-animations';

export type ActionPanelColors = 'green' | 'orange' | 'cosmic-blue';
export type Locations = 'top-left' | 'bottom-left' | 'top-right';

@Component({
  selector: 'cp-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss'],
  animations: [BasicAnimations.expandY],
})
export class ActionPanelComponent extends WithDestroy() {

  @Input() color: ActionPanelColors = 'green';
  @Input() location: Locations = 'top-left';
  @Input() startIcon: string = Icons.Hamburger;
  @Input() startTitle?: string;
  @Input() options: ActionOption[];

  icons = Icons;
  unreadCount: number;
  isOpen = false;

  constructor() {
    super();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    fromEvent(window, 'pointerup')
      .pipe(
        take(1),
        takeUntil(this.destroy$))
      .subscribe(() => this.close());
  }

  close() {
    this.isOpen = false;
  }
}
