import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  filter,
  firstValueFrom,
  skip,
  skipWhile,
  Subject,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { GameStateType } from '../common/domain/game-state-type';
import { GlobalStyleClass } from '../common/global-style-class';
import { WithDestroy } from '../common/with-destroy';
import { AccountDialogComponent } from '../overlays/account-dialog/account-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import {
  SimpleDialogComponent,
  SimpleDialogData,
} from '../overlays/simple-dialog/simple-dialog.component';
import { AnalyticsService } from './analytics.service';
import { AuthService } from './auth.service';
import { EventLogs } from './domain/event-logs';
import { EventService } from './event.service';
import { LocalStorageService } from './local-storage.service';
import { TutorialService } from './tutorial.service';

@Injectable({providedIn: 'root'})
export class GuidanceService extends WithDestroy() {

  private stopSupportDeveloperSnackbar$ = new Subject<void>();
  private stopSignUpDialog$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private tutorialService: TutorialService,
    private localStorageService: LocalStorageService,
    private eventService: EventService,
  ) {
    super();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stopSupportDeveloperSnackbar$.complete();
    this.stopSignUpDialog$.complete();
  }

  openTutorialDialog(context: GameStateType) {
    if (this.localStorageService.hasViewedTutorial()) {
      return;
    }

    this.dialog.open(SimpleDialogComponent, {
      disableClose: true,
      data: {
        title: 'First Visit?',
        descriptions: [
          'You can find the FAQ in the orange menu to the bottom corner of the screen.',
          'Do you want to start a detailed tutorial now? You can always find it in the orange menu.',
          'This is a tool to help players visualize and solve their ideas in Kerbal Space Program. ',
        ],
        okButtonText: 'Start Tutorial',
        cancelButtonText: 'Skip',
        focusOk: true,
      } as SimpleDialogData,
    })
      .afterClosed()
      .pipe(
        tap(ok => !ok && this.snackBar.open('Check out the FAQ in the orange menu',
          null, {duration: 10e3})),
        filter(ok => ok),
        takeUntil(this.destroy$))
      .subscribe(() => this.tutorialService.startFullTutorial(context));

    this.localStorageService.setTutorialViewed();
  }

  setSupportDeveloperSnackbar(withDestroy$: Subject<void>) {
    this.stopSupportDeveloperSnackbar$.next();
    this.eventService.userIdle$
      .pipe(
        skip(1),
        skipWhile(() => this.eventService.hasActiveOverlay()),
        take(1),
        takeUntil(withDestroy$),
        takeUntil(this.stopSupportDeveloperSnackbar$),
        takeUntil(this.destroy$))
      .subscribe(() => this.openSupportDeveloperSnackbar());
  }

  private async openSupportDeveloperSnackbar() {
    let user = await firstValueFrom(this.authService.user$);
    if (this.localStorageService.hasViewedSupportDeveloperSnackbar()
      && !(user?.isCustomer)) {
      return;
    }

    this.snackBar.open(
      'Want to support the developer?',
      'Yes',
      {duration: 10e3, panelClass: GlobalStyleClass.SnackbarPromoteFlash})
      .onAction()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.analyticsService.logEvent('Call coffee dialog from Snackbar', {category: EventLogs.Category.Coffee});
        this.dialog.open(BuyMeACoffeeDialogComponent);
      });
    this.localStorageService.setSupportDeveloperSnackbarViewed();
  }

  setSignUpDialog(withDestroy$: Subject<void>) {
    this.stopSignUpDialog$.next();
    this.eventService.userIdle$
      .pipe(
        skip(1),
        skipWhile(() => this.eventService.hasActiveOverlay()),
        take(1),
        takeUntil(withDestroy$),
        takeUntil(this.stopSignUpDialog$),
        takeUntil(this.destroy$))
      .subscribe(() => this.openSignUpDialog());
  }

  private async openSignUpDialog() {
    let user = await firstValueFrom(this.authService.user$);
    if (this.localStorageService.hasViewedSignUpDialogViewed() || user) {
      return;
    }

    this.dialog.open(AccountDialogComponent,
      {backdropClass: GlobalStyleClass.MobileFriendly})
      .afterClosed();

    this.localStorageService.setSignUpDialogViewed();
  }
}
