import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { Icons } from '../../common/domain/icons';
import { AuthService } from '../../services/auth.service';
import { WithDestroy } from '../../common/with-destroy';
import { filter, interval, map, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BuyMeACoffeeDialogComponent } from '../../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/event-logs';
import { environment } from '../../../environments/environment';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AdDispenserService } from '../../adsense-manager/services/ad-dispenser.service';
import { AdComponent } from '../../adsense-manager/components/ad/ad.component';

@Component({
  selector: 'cp-base-panel',
  templateUrl: './base-panel.component.html',
  styleUrls: ['./base-panel.component.scss'],
  animations: [CustomAnimation.height],
})
export class BasePanelComponent extends WithDestroy() implements AfterViewInit {

  @ViewChild('adDesktop') adDesktop: AdComponent;
  @ViewChild('adMobile') adMobile: AdComponent;

  isOpen = false;
  icons = Icons;
  unsubscribePanel$ = new Subject<void>();
  initialized = false;
  isAdBlocked$: Observable<boolean>;
  lastOpened = new Date();
  isMobile$ = this.breakpointObserver.observe(['(max-width: 1000px)'])
    .pipe(map(bp => bp.matches));

  constructor(private authService: AuthService,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService,
              private breakpointObserver: BreakpointObserver,
              private adDispenserService: AdDispenserService) {
    super();

    this.isAdBlocked$ = adDispenserService.isAdBlocked$.asObservable();
  }

  ngAfterViewInit() {
    this.closePanel(60e3);

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => {
        if (u?.isCustomer) {
          this.isOpen = false;
          this.unsubscribePanel$.next();
        } else {
          this.closePanel(40e3);
        }
      });
  }

  closePanel(delay: number = 90e3) {
    if (!environment.production) {
      return;
    }

    this.isOpen = false;
    this.unsubscribePanel$.next();

    interval(delay)
      .pipe(
        switchMap(() => this.isAdBlocked$),
        filter(isAdBlocked => !this.isOpen
          && (isAdBlocked || this.isAdFilled())),
        take(1),
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

  private isAdFilled(): boolean {
    let ad = this.adDesktop ?? this.adMobile;
    let isAdFilled = false;
    if (ad?.ins) {
      isAdFilled = ad.ins
        .nativeElement
        .attributes['data-ad-status']
        ?.value === 'filled';
    }

    return isAdFilled;
  }

  openCoffeeDialog() {
    this.dialog.open(BuyMeACoffeeDialogComponent);

    this.analyticsService.logEvent('Call coffee dialog from ad',
      {category: EventLogs.Category.Coffee});
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
