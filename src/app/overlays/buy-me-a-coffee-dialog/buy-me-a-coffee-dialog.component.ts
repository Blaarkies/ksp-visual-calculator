import { Component } from '@angular/core';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';

@Component({
  selector: 'cp-buy-me-a-coffee-dialog',
  templateUrl: './buy-me-a-coffee-dialog.component.html',
  styleUrls: ['./buy-me-a-coffee-dialog.component.scss'],
})
export class BuyMeACoffeeDialogComponent {

  constructor(private analyticsService: AnalyticsService) {
  }

  logCoffeeEvent() {
    this.analyticsService.logEvent('Routed to BuyMeACoffee',
      {category: EventLogs.Category.Coffee});
  }

}
