import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionGroupType } from '../hud.component';
import { Icons } from '../../../common/domain/icons';
import { ActionPanelColors } from '../../action-panel/action-panel.component';
import { ActionOption } from '../../../common/domain/action-option';

@Component({
  selector: 'cp-action-fab',
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
