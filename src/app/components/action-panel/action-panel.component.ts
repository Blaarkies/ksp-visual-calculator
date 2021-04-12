import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Icons } from '../../common/domain/icons';
import { ActionOption, ActionOptionType } from '../../common/domain/action-option';

@Component({
  selector: 'cp-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActionPanelComponent {

  @Input() color: 'green' | 'orange' | 'cosmic-blue' = 'green';
  @Input() location: 'top-left' | 'bottom-left' | 'top-right' = 'top-left';
  @Input() startIcon = Icons.Hamburger;
  @Input() startTitle?: string;

  private _options: ActionOption[];
  get options(): ActionOption[] {
    return this._options;
  }

  @Input() set options(value: ActionOption[]) {
    this._options = value;
    this.unreadCount = value.count(ao => ao.unread);
  }

  icons = Icons;
  actionTypes = ActionOptionType;
  unreadCount: number;

  updateUnreads(option: ActionOption) {
    option.unread = false;
    this.unreadCount = this._options.count(ao => ao.unread);
  }
}
