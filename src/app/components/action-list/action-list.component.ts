import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  MatTooltipModule,
  TooltipPosition,
} from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import {
  ActionOption,
  ActionOptionType,
} from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/domain/event-logs';
import { ActionPanelColors } from '../hud/action-panel/action-panel.component';

@Component({
  selector: 'cp-action-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatIconModule,
    MatTooltipModule,
    MatListModule,
    RouterModule,
  ],
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActionListComponent {

  @Input() color: ActionPanelColors = 'green';
  @Input() justifyRight: boolean;
  @Input() tooltipPosition: TooltipPosition = 'right';
  @Input() options: ActionOption[];
  @Output() action = new EventEmitter<ActionOption>();

  icons = Icons;
  actionTypes = ActionOptionType;

  constructor(private analyticsService: AnalyticsService) {
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
