import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Icons } from '../../common/domain/icons';
import { ActionOption, ActionOptionType } from '../../common/domain/action-option';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';
import { ActionPanelColors } from '../action-panel/action-panel.component';
import { WithDestroy } from '../../common/with-destroy';

@Component({
    selector: 'cp-action-list',
    templateUrl: './action-list.component.html',
    styleUrls: ['./action-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ActionListComponent extends WithDestroy() {

    @Input() color: ActionPanelColors = 'green';
    @Input() justifyRight: boolean;

    private actionOptions: ActionOption[];

    get options(): ActionOption[] {
        return this.actionOptions;
    }

    @Input() set options(value: ActionOption[]) {
        this.actionOptions = value ?? [];
        setTimeout(() =>
            this.unreadCount = this.actionOptions.count(ao => ao.unread));
    }

    @Output() action = new EventEmitter();

    unreadCount: number;

    icons = Icons;
    actionTypes = ActionOptionType;

    constructor(private analyticsService: AnalyticsService) {
        super();
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
