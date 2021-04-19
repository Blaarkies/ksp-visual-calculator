import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'cp-privacy-dialog',
  templateUrl: './privacy-dialog.component.html',
  styleUrls: ['./privacy-dialog.component.scss'],
})
export class PrivacyDialogComponent {

  trackingControl = new FormControl(this.analyticsService.isTracking);

  constructor(private analyticsService: AnalyticsService) {
    this.trackingControl.valueChanges
      .pipe()
      .subscribe(isTracking => this.analyticsService.setActive(isTracking));
  }

}
