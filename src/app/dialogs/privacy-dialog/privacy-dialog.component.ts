import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnalyticsService } from '../../services/analytics.service';
import { takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';

@Component({
  selector: 'cp-privacy-dialog',
  templateUrl: './privacy-dialog.component.html',
  styleUrls: ['./privacy-dialog.component.scss'],
})
export class PrivacyDialogComponent extends WithDestroy() {

  trackingControl = new FormControl(this.analyticsService.isTracking);

  constructor(private analyticsService: AnalyticsService) {
    super();

    this.trackingControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isTracking => this.analyticsService.setActive(isTracking));
  }

}
