import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { SimpleDialogComponent, SimpleDialogData } from '../../dialogs/simple-dialog/simple-dialog.component';
import { PrivacyDialogComponent } from '../../dialogs/privacy-dialog/privacy-dialog.component';
import { CreditsDialogComponent } from '../../dialogs/credits-dialog/credits-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../../dialogs/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { FeedbackDialogComponent } from '../../dialogs/feedback-dialog/feedback-dialog.component';
import { filter, takeUntil } from 'rxjs/operators';
import { TutorialService } from '../../services/tutorial.service';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';
import { WithDestroy } from '../../common/with-destroy';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'cp-app-info-action-panel',
  templateUrl: './app-info-action-panel.component.html',
  styleUrls: ['./app-info-action-panel.component.scss'],
})
export class AppInfoActionPanelComponent extends WithDestroy() {

  infoOptions: ActionOption[];

  constructor(snackBar: MatSnackBar,
              dialog: MatDialog,
              tutorialService: TutorialService,
              analyticsService: AnalyticsService,
              private stateService: StateService) {
    super();

    this.infoOptions = [
      new ActionOption('Tutorial', Icons.Help, {
          action: () => {
            analyticsService.logEvent('Call tutorial dialog', {
              category: EventLogs.Category.Tutorial,
            });

            dialog.open(SimpleDialogComponent, {
              data: {
                title: 'Start Tutorial',
                descriptions: [
                  'Do you want to start the tutorial?',
                  'This will take you through all the features and controls to navigate and use this application.',
                ],
                okButtonText: 'Start',
              } as SimpleDialogData,
            })
              .afterClosed()
              .pipe(
                filter(ok => ok),
                takeUntil(this.destroy$))
              .subscribe(() => tutorialService.startFullTutorial());
          },
        },
        undefined,
        !localStorage.getItem('ksp-commnet-planner-tutorial-viewed'),
        () => localStorage.setItem('ksp-commnet-planner-tutorial-viewed', true.toString())),
      new ActionOption('Privacy', Icons.Analytics, {
          action: () => {
            analyticsService.logEvent('Call privacy dialog', {
              category: EventLogs.Category.Privacy,
            });

            dialog.open(PrivacyDialogComponent)
              .afterClosed()
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          },
        },
        'View privacy statement and settings',
        !localStorage.getItem('ksp-commnet-planner-privacy-viewed'),
        () => localStorage.setItem('ksp-commnet-planner-privacy-viewed', true.toString())),
      // new ActionOption('Account', Icons.AccountSettings, {
      //   action: () => {
      //     analyticsService.logEvent('Call account dialog', {
      //       category: EventLogs.Category.Account,
      //     });
      //
      //     dialog.open(AccountDialogComponent)
      //       .afterClosed()
      //       .pipe(takeUntil(this.destroy$))
      //       .subscribe();
      //   },
      // }),
      new ActionOption('Credits', Icons.Credits, {
        action: () => {
          analyticsService.logEvent('Call Credits dialog', {
            category: EventLogs.Category.Credits,
          });

          dialog.open(CreditsDialogComponent)
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        },
      }),
      new ActionOption('Buy me a Coffee', Icons.Coffee, {
          action: () => {
            analyticsService.logEvent('Call coffee dialog', {
              category: EventLogs.Category.Coffee,
            });

            dialog.open(BuyMeACoffeeDialogComponent)
              .afterClosed()
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          },
        },
        'A platform for supporting the developer'),
      new ActionOption('Feedback', Icons.Feedback, {
        action: () => {
          analyticsService.logEvent('Call feedback dialog', {
            category: EventLogs.Category.Feedback,
          });

          dialog.open(FeedbackDialogComponent)
            .afterClosed()
            .pipe(
              filter(ok => ok),
              takeUntil(this.destroy$))
            .subscribe(details => analyticsService.logEvent('User feedback', {
                category: EventLogs.Category.Feedback,
                ...details,
              }),
            );
        },
      }),
    ];
  }

  printState() {
    let out = this.stateService.state;

    console.log('state', out);

    localStorage.setItem('ksp-commnet-planner-last-state', out);
  }
}
