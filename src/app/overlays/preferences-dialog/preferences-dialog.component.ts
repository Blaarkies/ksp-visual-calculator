import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  takeUntil,
} from 'rxjs';
import { Icons } from '../../common/domain/icons';
import { WithDestroy } from '../../common/with-destroy';
import { InputToggleComponent } from '../../components/controls/input-toggle/input-toggle.component';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';
import {
  ThemeService,
  ThemeTypeEnum,
} from '../../services/theme.service';
import { AnalyticsDialogComponent } from '../analytics-dialog/analytics-dialog.component';

@Component({
  selector: 'cp-preferences-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    InputToggleComponent,
    MatIconModule,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  templateUrl: './preferences-dialog.component.html',
  styleUrls: ['./preferences-dialog.component.scss'],
})
export class PreferencesDialogComponent extends WithDestroy() {

  icons = Icons;
  controlTheme = new FormControl(this.themeService.theme === ThemeTypeEnum.Light, {});
  controlHolidays = new FormControl(this.storageService.hasHolidays(), {});
  controlAnalytics = new FormControl(this.analyticsService.isTracking, {});

  noUserLoggedIn$ = this.authService.user$.pipe(map(u => !u), shareReplay(1));

  constructor(
    private themeService: ThemeService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private dialog: MatDialog,
    private storageService: LocalStorageService,
  ) {
    super();

    themeService.isLightTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.controlTheme.setValue(v, {emitEvent: false}));
    this.controlTheme.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$))
      .subscribe(() => this.themeService.toggleTheme());

    this.controlHolidays.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$))
      .subscribe(show => this.storageService.setHolidaysShown(show));

    this.controlAnalytics.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$))
      .subscribe(track => this.analyticsService.setActive(track));
  }

  openAnalyticsDialog() {
    this.dialog.closeAll();
    this.dialog.open(AnalyticsDialogComponent);
  }

}
