import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnalyticsService } from '../../services/analytics.service';
import { WithDestroy } from '../../common/with-destroy';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'cp-analytics-dialog',
  templateUrl: './analytics-dialog.component.html',
  styleUrls: ['./analytics-dialog.component.scss'],
})
export class AnalyticsDialogComponent extends WithDestroy() {

  trackingControl = new FormControl(this.analyticsService.isTracking);

  constructor(private analyticsService: AnalyticsService) {
    super();

    this.trackingControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isTracking => this.analyticsService.setActive(isTracking));
  }

}
