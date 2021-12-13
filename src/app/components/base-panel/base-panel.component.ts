import { Component } from '@angular/core';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { Icons } from '../../common/domain/icons';
import { AuthService } from '../../services/auth.service';
import { WithDestroy } from '../../common/with-destroy';
import { filter, Subject, switchMap, take, takeUntil, timer } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BuyMeACoffeeDialogComponent } from '../../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/event-logs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'cp-base-panel',
  templateUrl: './base-panel.component.html',
  styleUrls: ['./base-panel.component.scss'],
  animations: [CustomAnimation.height],
})
export class BasePanelComponent extends WithDestroy() {

  isOpen = false;
  icons = Icons;
  unsubscribePanel$ = new Subject<void>();
  initialized = false;
  nothingToDisplay = false;
  lastOpened = new Date();

  constructor(private authService: AuthService,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService) {
    super();

    this.closePanel(40e3);

    authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => {
        if (u?.isCustomer) {
          this.isOpen = false;
          this.unsubscribePanel$.next();
        } else {
          this.closePanel(40e3);
        }
      });

    setTimeout(() => this.moveElement(), 1000);
  }

  closePanel(delay: number = 90e3) {
    if (!environment.production) {
      return;
    }

    this.moveElement();
    this.isOpen = false;
    this.unsubscribePanel$.next();

    timer(delay)
      .pipe(
        take(1),
        filter(() => !this.isOpen),
        switchMap(() => this.authService.user$),
        filter(u => !u?.isCustomer),
        takeUntil(this.destroy$),
        takeUntil(this.unsubscribePanel$))
      .subscribe(() => {
        this.isOpen = true;
        this.initialized = true;
        this.lastOpened = new Date();
      });
  }

  openCoffeeDialog() {
    this.dialog.open(BuyMeACoffeeDialogComponent);

    this.analyticsService.logEvent('Call coffee dialog from ad',
      {category: EventLogs.Category.Coffee});
  }

  private moveElement() {
    if (this.initialized) {
      return;
    }
    let adElement = document.querySelector('[id^=exoNativeWidget], .exo-native-widget');
    let adSpace = document.querySelector('#placementSpace');

    if (adElement && adSpace) {
      adSpace.appendChild(adElement);
      this.initialized = true;
      this.nothingToDisplay = false;
    } else {
      this.nothingToDisplay = true;
    }
  }

  buttonClosePanel() {
    this.closePanel();
    this.analyticsService.logEvent('User closed ad',
      {
        category: EventLogs.Category.Ads,
        secondsOpen: Math.round((new Date().getTime() - this.lastOpened.getTime()) * .001),
      });
  }
}
