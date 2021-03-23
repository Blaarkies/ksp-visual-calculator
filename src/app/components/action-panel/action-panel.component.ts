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

  @Input() color: 'green' | 'orange' = 'green';
  @Input() location: 'top-left' | 'bottom-left' = 'top-left';
  @Input() startIcon = Icons.Hamburger;
  @Input() startTitle?: string;
  @Input() options: ActionOption[];

  icons = Icons;
  actionTypes = ActionOptionType;

}
