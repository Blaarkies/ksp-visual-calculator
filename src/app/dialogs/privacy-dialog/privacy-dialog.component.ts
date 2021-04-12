import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UsageTrackingService } from '../../services/usage-tracking.service';

@Component({
  selector: 'cp-privacy-dialog',
  templateUrl: './privacy-dialog.component.html',
  styleUrls: ['./privacy-dialog.component.scss'],
})
export class PrivacyDialogComponent {

  trackingControl = new FormControl(this.usageTrackingService.isTracking);

  constructor(private usageTrackingService: UsageTrackingService) {
    this.trackingControl.valueChanges
      .pipe()
      .subscribe(isTracking => this.usageTrackingService.isTracking = isTracking);
  }

}
