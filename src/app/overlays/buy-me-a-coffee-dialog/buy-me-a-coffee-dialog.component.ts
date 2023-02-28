import { Component } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/domain/event-logs';
import { BasicAnimations } from '../../common/animations/basic-animations';
import {CommonModule} from "@angular/common";
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'cp-buy-me-a-coffee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './buy-me-a-coffee-dialog.component.html',
  styleUrls: ['./buy-me-a-coffee-dialog.component.scss'],
  animations: [BasicAnimations.fade],
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
