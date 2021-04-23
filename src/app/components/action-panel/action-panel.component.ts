import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Icons } from '../../common/domain/icons';
import { ActionOption, ActionOptionType } from '../../common/domain/action-option';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';

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

  private actionOptions: ActionOption[];
  get options(): ActionOption[] {
    return this.actionOptions;
  }

  @Input() set options(value: ActionOption[]) {
    this.actionOptions = value ?? [];
    this.unreadCount = this.actionOptions.count(ao => ao.unread);
  }

  icons = Icons;
  actionTypes = ActionOptionType;
  unreadCount: number;

  constructor(private analyticsService: AnalyticsService) {
  }

  updateUnreads(option: ActionOption) {
    option.readNotification();
    this.unreadCount = this.actionOptions.count(ao => ao.unread);
  }

  logExternalLink(externalRoute: string) {
    this.analyticsService.logEvent('Routed to external link', {
      category: EventLogs.Category.Route,
      link: externalRoute,
      external: true,
    });
  }

  logRoute(route: string) {
    this.analyticsService.logEvent('Routed to page', {
      category: EventLogs.Category.Route,
      link: route,
      external: false,
    });
  }
}
