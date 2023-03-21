import { Injectable } from '@angular/core';
import {
  filter,
  firstValueFrom,
  map,
  startWith,
} from 'rxjs';
import { ActionOption } from '../common/domain/action-option';
import { Icons } from '../common/domain/icons';
import { AnalyticsService } from './analytics.service';
import { ManageStateDialogComponent } from '../overlays/manage-state-dialog/manage-state-dialog.component';
import { AccountDialogComponent } from '../overlays/account-dialog/account-dialog.component';
import {
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthService } from './auth.service';
import {
  SimpleDialogComponent,
  SimpleDialogData,
} from '../overlays/simple-dialog/simple-dialog.component';
import { AnalyticsDialogComponent } from '../overlays/analytics-dialog/analytics-dialog.component';
import { CreditsDialogComponent } from '../overlays/credits-dialog/credits-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { FeedbackDialogComponent } from '../overlays/feedback-dialog/feedback-dialog.component';
import { TutorialService } from './tutorial.service';
import { GlobalStyleClass } from '../common/global-style-class';
import { EventLogs } from './domain/event-logs';
import { PolicyDialogComponent } from '../overlays/policy-dialog/policy-dialog.component';
import { UsableRoutes } from '../app.routes';
import { GameStateType } from '../common/domain/game-state-type';
import {
  FaqDialogComponent,
  FaqDialogData,
} from '../overlays/faq-dialog/faq-dialog.component';

let storageKeys = {
  firstVisitDeprecated: 'ksp-visual-calculator-first-visit',
  tutorialViewed: 'ksp-visual-calculator-tutorial-viewed',
  analyticsViewed: 'ksp-visual-calculator-analytics-viewed',
  privacyPolicyViewed: 'ksp-visual-calculator-privacy-policy-viewed',
};

type HookIO<T> = (ref: MatDialogRef<T>) => void;

@Injectable()
export class HudService {

  constructor(private dialog: MatDialog,
              private tutorialService: TutorialService,
              private analyticsService: AnalyticsService,
              private authService: AuthService) {
  }

  navigationOptions: ActionOption[] = [
    new ActionOption(
      'Introduction',
      Icons.BookOpen,
      {route: UsableRoutes.Intro},
      'Article that explains the details of each calculator'),
    new ActionOption(
      'Delta-v Planner',
      Icons.DeltaV,
      {route: UsableRoutes.DvPlanner},
      'Calculates the required delta-v for a specified mission'),
    new ActionOption(
      'CommNet Planner',
      Icons.Relay,
      {route: UsableRoutes.CommnetPlanner},
      'Calculates CommNet ranges'),
    new ActionOption(
      'Pocket Calculators (Beta)',
      Icons.PocketCalculator,
      {route: UsableRoutes.PocketCalculators},
      'Simple calculators for that solve specific problems'),
    new ActionOption('', '', {divider: true}),
    new ActionOption(
      'Source Code - GitHub',
      Icons.SourceCode,
      {externalRoute: 'https://github.com/Blaarkies/ksp-visual-calculator'}),
    new ActionOption(
      'Blaarkies Hub',
      Icons.Blaarkies,
      {externalRoute: 'https://blaarkies.com/'},
      'More tools made by Blaarkies'),
  ];

  infoOptions: ActionOption[] = [
    new ActionOption('Analytics', Icons.Analytics, {
        action: () => {
          this.analyticsService.logEvent('Call analytics dialog', {
            category: EventLogs.Category.Privacy,
          });

          this.dialog.open(AnalyticsDialogComponent);
        },
      },
      undefined,
      !localStorage.getItem(storageKeys.analyticsViewed),
      () => localStorage.setItem(storageKeys.analyticsViewed, true.toString())),
    new ActionOption('Credits', Icons.Credits, {
      action: () => {
        this.analyticsService.logEvent('Call Credits dialog', {
          category: EventLogs.Category.Credits,
        });

        this.dialog.open(CreditsDialogComponent);
      },
    }),
    new ActionOption('Buy Me a Coffee', Icons.Coffee, {
        action: () => {
          this.analyticsService.logEvent('Call coffee dialog from Information', {
            category: EventLogs.Category.Coffee,
          });

          this.dialog.open(BuyMeACoffeeDialogComponent);
        },
      },
      'A platform for supporting the developer'),
    new ActionOption('Feedback', Icons.Feedback, {
      action: () => {
        this.analyticsService.logEvent('Call feedback dialog', {
          category: EventLogs.Category.Feedback,
        });

        this.dialog.open(FeedbackDialogComponent, {backdropClass: GlobalStyleClass.MobileFriendly});
      },
    }),
    new ActionOption('Privacy Policy', Icons.Policy, {
        action: () => {
          this.analyticsService.logEvent('Call privacy policy dialog', {
            category: EventLogs.Category.Policy,
          });

          this.dialog.open(PolicyDialogComponent, {backdropClass: GlobalStyleClass.MobileFriendly});
        },
      },
      undefined,
      !localStorage.getItem(storageKeys.privacyPolicyViewed),
      () => localStorage.setItem(storageKeys.privacyPolicyViewed, true.toString())),
  ];

  createActionOptionManageSaveGames(hookIO: HookIO<ManageStateDialogComponent>): ActionOption {
    return new ActionOption('Manage Save Games', Icons.Storage, {
        action: () => {
          this.analyticsService.logEvent('Call state dialog', {
            category: EventLogs.Category.State,
          });

          let dialogRef = this.dialog.open(ManageStateDialogComponent,
            {backdropClass: GlobalStyleClass.MobileFriendly});
          hookIO(dialogRef);
        },
      }, undefined, false, undefined,
      {
        unavailable$: this.authService.user$.pipe(map(user => user === null || !user?.isCustomer), startWith(true)),
        tooltip: `Save games are only available after supporting on 'buymeacoffee.com/Blaarkies'`,
        action: async () => {
          let user = await firstValueFrom(this.authService.user$);

          if (!user) {
            this.analyticsService.logEvent('Call account dialog from Edit Universe', {category: EventLogs.Category.Account});
            this.dialog.open(AccountDialogComponent, {backdropClass: GlobalStyleClass.MobileFriendly});
            return Promise.resolve();
          }

          if (user?.isCustomer === false) {
            this.analyticsService.logEvent('Call coffee dialog from Edit Universe', {category: EventLogs.Category.Coffee});
            this.dialog.open(BuyMeACoffeeDialogComponent);
            return Promise.resolve();
          }
        },
      },
    );
  }

  createActionOptionTutorial(gameStateType: GameStateType): ActionOption {
    return new ActionOption('Tutorial', Icons.Help, {
        action: () => {
          this.analyticsService.logEvent('Call tutorial dialog', {
            category: EventLogs.Category.Tutorial,
          });

          this.dialog.open(SimpleDialogComponent, {
            data: {
              title: 'Start Tutorial',
              descriptions: [
                'Do you want to start the tutorial?',
                'This will take you through all the features and controls to navigate and use this page.',
              ],
              okButtonText: 'Start',
            } as SimpleDialogData,
          })
            .afterClosed()
            .pipe(filter(ok => ok))
            .subscribe(() => this.tutorialService.startFullTutorial(gameStateType));
        },
      },
      undefined,
      !localStorage.getItem(storageKeys.tutorialViewed),
      () => localStorage.setItem(storageKeys.tutorialViewed, true.toString()));
  }

  createActionOptionFaq(context: GameStateType) {
    return new ActionOption('FAQ', Icons.Help, {
        action: () => {
          this.analyticsService.logEvent('Open faq dialog', {
            category: EventLogs.Category.Help,
          });

          this.dialog.open(FaqDialogComponent, {
            data: {gameStateType: context} as FaqDialogData,
            backdropClass: GlobalStyleClass.MobileFriendly,
          });
        },
      },
    );
  }

}
