import { Component, Input } from '@angular/core';
import { Icons } from '../../common/domain/icons';
import { ActionOption } from '../../common/domain/action-option';
import { fromEvent, take, takeUntil } from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { BasicAnimations } from '../../animations/basic-animations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { ActionListComponent } from '../action-list/action-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export type ActionPanelColors = 'green' | 'orange' | 'cosmic-blue';
export type Locations = 'top-left' | 'bottom-left' | 'top-right';

@Component({
  standalone: true,
  selector: 'cp-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss'],
  animations: [BasicAnimations.expandY],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    ActionListComponent,
  ],
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
