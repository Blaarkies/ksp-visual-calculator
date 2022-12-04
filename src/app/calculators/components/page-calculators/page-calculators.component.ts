import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { delay, distinctUntilChanged, filter, Subject, switchMap, take, takeUntil, tap, timer } from 'rxjs';
import { WithDestroy } from '../../../common/with-destroy';
import { UsableRoutes } from '../../../usable-routes';
import { AuthService } from '../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AccountDialogComponent } from '../../../overlays/account-dialog/account-dialog.component';
import { GlobalStyleClass } from '../../../common/global-style-class';
import { SimpleDialogComponent, SimpleDialogData } from '../../../overlays/simple-dialog/simple-dialog.component';
import { TutorialService } from '../../../services/tutorial.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HudService } from '../../../services/hud.service';
import { EventLogs } from '../../../services/event-logs';
import { BuyMeACoffeeDialogComponent } from '../../../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { AnalyticsService } from '../../../services/analytics.service';
import { RouteData } from '../../calculators-routing.module';

let localStorageKeyFirstVisitDeprecated = 'ksp-visual-calculator-first-visit';
let localStorageKeyTutorialViewed = 'ksp-visual-calculator-tutorial-viewed';
let localStorageKeyLastSignInSuggestionDate = 'ksp-visual-calculator-last-sign-in-suggestion-date';

@Component({
  selector: 'cp-page-calculators',
  templateUrl: './page-calculators.component.html',
  styleUrls: ['./page-calculators.component.scss']
})
export class PageCalculatorsComponent extends WithDestroy() {

  calculatorType: UsableRoutes;
  calculators = UsableRoutes;
  signInDialogOpen$ = new Subject<void>();

  constructor(activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private tutorialService: TutorialService,
              private hudService: HudService,
              private analyticsService: AnalyticsService) {
    super();

    let routesMap = {
      [`${UsableRoutes.DvPlanner}`]: UsableRoutes.DvPlanner,
      [`${UsableRoutes.SignalCheck}`]: UsableRoutes.SignalCheck,
    };

    activatedRoute.data
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: RouteData) =>
        this.calculatorType = routesMap[data.calculatorType]);

    let minute = 60 * 1e3;
    this.authService
      .user$
      .pipe(
        take(1),
        delay(minute),
        filter(user => user === null && this.timeSinceLastSignInDialog() > minute),
        switchMap(() => {
          localStorage.setItem(localStorageKeyLastSignInSuggestionDate, new Date().getTime().toString());

          return this.dialog.open(AccountDialogComponent,
            {backdropClass: GlobalStyleClass.MobileFriendly})
            .afterClosed();
        }),
        delay(minute),
        tap(() => this.signInDialogOpen$.next()),
        takeUntil(this.destroy$))
      .subscribe();

    this.signInDialogOpen$
      .pipe(
        tap(() => {
          if (!localStorage.getItem(localStorageKeyFirstVisitDeprecated)) {
            localStorage.setItem(localStorageKeyFirstVisitDeprecated, true.toString());
            this.triggerFirstVisitDialog();
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();

    this.authService.user$
      .pipe(
        distinctUntilChanged(),
        filter(u => !(u?.isCustomer)),
        switchMap(() => timer(7 * minute, 15 * minute)),
        switchMap(() => this.snackBar.open(
          'Would you like to support the developer?',
          'Yes',
          {duration: 10e3, panelClass: GlobalStyleClass.SnackbarPromoteFlash})
          .onAction()),
        tap(() => {
          this.analyticsService.logEvent('Call coffee dialog from Snackbar', {category: EventLogs.Category.Coffee});
          this.dialog.open(BuyMeACoffeeDialogComponent);
        }))
      .subscribe();
  }

  private timeSinceLastSignInDialog(): number {
    let lastDate = localStorage.getItem(localStorageKeyLastSignInSuggestionDate)?.toNumber() || 0;
    let difference = new Date().getTime() - new Date(lastDate).getTime();
    return difference;
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
