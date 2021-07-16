import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Icons } from '../../common/domain/icons';
import { ActionOption } from '../../common/domain/action-option';
import { MatExpansionPanel } from '@angular/material/expansion';
import { fromEvent } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';

export type ActionPanelColors = 'green' | 'orange' | 'cosmic-blue';
export type Locations = 'top-left' | 'bottom-left' | 'top-right';

@Component({
  selector: 'cp-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActionPanelComponent extends WithDestroy() {

  @Input() color: ActionPanelColors = 'green';
  @Input() location: Locations = 'top-left';
  @Input() startIcon: Icons = Icons.Hamburger;
  @Input() startTitle?: string;
  @Input() options: ActionOption[];

  icons = Icons;
  unreadCount: number;

  constructor() {
    super();
  }

  listenClickAway(expander: MatExpansionPanel) {
    fromEvent(window, 'pointerup')
      .pipe(
        take(1),
        takeUntil(this.destroy$))
      .subscribe(() => expander.close());
  }
}
