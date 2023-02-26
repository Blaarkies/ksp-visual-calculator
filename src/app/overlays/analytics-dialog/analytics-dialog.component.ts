import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {AnalyticsService} from '../../services/analytics.service';
import {WithDestroy} from '../../common/with-destroy';
import {takeUntil} from 'rxjs';
import {MatDialogModule} from "@angular/material/dialog";
import {InputToggleComponent} from "../../components/controls/input-toggle/input-toggle.component";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'cp-analytics-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    InputToggleComponent,
    ReactiveFormsModule,
    MatButtonModule,
  ],
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
