import { Component } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/event-logs';
import { CustomAnimation } from '../../common/domain/custom-animation';

@Component({
  selector: 'cp-buy-me-a-coffee-dialog',
  templateUrl: './buy-me-a-coffee-dialog.component.html',
  styleUrls: ['./buy-me-a-coffee-dialog.component.scss'],
  animations: [CustomAnimation.fade],
})
export class BuyMeACoffeeDialogComponent {

  didClickLink = false;

  constructor(private analyticsService: AnalyticsService) {
  }

  logCoffeeEvent() {
    this.analyticsService.logEvent('Routed to BuyMeACoffee',
      {category: EventLogs.Category.Coffee});

    this.didClickLink = true;
  }

}
