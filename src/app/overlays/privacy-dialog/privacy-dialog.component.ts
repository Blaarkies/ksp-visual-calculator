import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AnalyticsService } from '../../services/analytics.service';
import { WithDestroy } from '../../common/with-destroy';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'cp-privacy-dialog',
  templateUrl: './privacy-dialog.component.html',
  styleUrls: ['./privacy-dialog.component.scss'],
})
export class PrivacyDialogComponent extends WithDestroy() {

  trackingControl = new UntypedFormControl(this.analyticsService.isTracking);

  constructor(private analyticsService: AnalyticsService) {
    super();

    this.trackingControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isTracking => this.analyticsService.setActive(isTracking));
  }

}
