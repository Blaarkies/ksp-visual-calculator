import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionGroupType } from '../action-group-type';
import { ActionPanelColors } from '../../action-panel/action-panel.component';
import { ActionOption } from '../../../common/domain/action-option';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'cp-action-fab',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './action-fab.component.html',
  styleUrls: ['./action-fab.component.scss'],
})
export class ActionFabComponent {

  @Input() actionGroupType: ActionGroupType;
  @Input() color: ActionPanelColors;
  @Input() icon: string;
  @Input() tooltip: string;

  @Input() set options(value: ActionOption[]) {
    this.lastOptions = value;
    this.updateUnreadCount();
  }

  @Output() activate = new EventEmitter<{ group: ActionGroupType, callback: () => void }>();

  unreadCount: number;
  lastOptions: ActionOption[];

  private updateUnreadCount() {
    this.unreadCount = this.lastOptions.count(ao => ao.unread);
  }

  actionButton() {
    this.activate.emit({
      group: this.actionGroupType,
      callback: () => this.updateUnreadCount(),
    });
  }

}
