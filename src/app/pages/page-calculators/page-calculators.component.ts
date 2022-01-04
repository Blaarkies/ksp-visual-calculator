import { AfterViewInit, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, switchMap, take, takeUntil, tap, timer } from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { UsableRoutes } from '../../usable-routes';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AccountDialogComponent } from '../../overlays/account-dialog/account-dialog.component';
import { GlobalStyleClass } from '../../common/global-style-class';
import { SimpleDialogComponent, SimpleDialogData } from '../../overlays/simple-dialog/simple-dialog.component';
import { TutorialService } from '../../services/tutorial.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HudService } from '../../services/hud.service';
import { EventLogs } from '../../services/event-logs';
import { BuyMeACoffeeDialogComponent } from '../../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { AnalyticsService } from '../../services/analytics.service';

let localStorageKeyFirstVisitDeprecated = 'ksp-visual-calculator-first-visit';
let localStorageKeyTutorialViewed = 'ksp-visual-calculator-tutorial-viewed';

@Component({
  selector: 'cp-page-calculators',
  templateUrl: './page-calculators.component.html',
  styleUrls: ['./page-calculators.component.scss']
})
export class PageCalculatorsComponent extends WithDestroy() implements AfterViewInit {

  calculatorType: UsableRoutes;
  calculators = UsableRoutes;

  constructor(router: Router,
              private authService: AuthService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private tutorialService: TutorialService,
              private hudService: HudService,
              private analyticsService: AnalyticsService) {
    super();

    let routesMap = {
      [`/${UsableRoutes.DvPlanner}`]: UsableRoutes.DvPlanner,
      [`/${UsableRoutes.SignalCheck}`]: UsableRoutes.SignalCheck,
    };

    router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$))
      .subscribe((e: NavigationEnd) => this.calculatorType = routesMap[e.url]);

    this.authService
      .user$
      .pipe(
        take(1),
        filter(user => user === null),
        takeUntil(this.destroy$))
      .subscribe(() => this.dialog.open(AccountDialogComponent,
        {backdropClass: GlobalStyleClass.MobileFriendly}));

    let minute = 60 * 1e3;
    this.authService.user$
      .pipe(
        distinctUntilChanged(),
        filter(u => !(u?.isCustomer)),
        switchMap(() => timer(2 * minute, 5 * minute)),
        switchMap(() => this.snackBar.open(
          'Would you like to support the developer?',
          'Yes',
          {duration: 15e3, panelClass: GlobalStyleClass.SnackbarPromoteFlash})
          .onAction()),
        tap(() => {
          this.analyticsService.logEvent('Call coffee dialog from Snackbar', {category: EventLogs.Category.Coffee});
          this.dialog.open(BuyMeACoffeeDialogComponent);
        }))
      .subscribe();
  }

  ngAfterViewInit() {
    if (!localStorage.getItem(localStorageKeyFirstVisitDeprecated)) {
      localStorage.setItem(localStorageKeyFirstVisitDeprecated, true.toString());
      this.triggerFirstVisitDialog();
    }
  }

  private triggerFirstVisitDialog() {
    this.dialog.open(SimpleDialogComponent, {
      disableClose: true,
      data: {
        title: 'First Visit?',
        descriptions: [
          'There is an orange quick-help button in the top-left corner that can explain the control scheme.',
          'You can start a detailed tutorial now, or if you prefer later, you can find it in the blue "Information" menu.',
          'This is a tool to help players visualize and solve their ideas in Kerbal Space Program. ',
        ],
        okButtonText: 'Start Tutorial',
        cancelButtonText: 'Skip',
        focusOk: true,
      } as SimpleDialogData,
    })
      .afterClosed()
      .pipe(
        tap(ok => !ok && this.snackBar.open('Check out the control scheme by clicking the orange help button',
          null, {duration: 15e3})),
        filter(ok => ok),
        takeUntil(this.destroy$))
      .subscribe(() => {
        localStorage.setItem(localStorageKeyTutorialViewed, true.toString());
        this.tutorialService.startFullTutorial(this.hudService.pageContext);
      });
  }

}
