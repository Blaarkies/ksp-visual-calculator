import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  filter,
  firstValueFrom,
  map,
  startWith,
} from 'rxjs';
import { UsableRoutes } from '../app.routes';
import { ActionOption } from '../common/domain/action-option';
import { GameStateType } from '../common/domain/game-state-type';
import { Icons } from '../common/domain/icons';
import { HookIO } from '../common/domain/mat-dialog-handler/hook-io';
import { GlobalStyleClass } from '../common/global-style-class';
import { AccountDialogComponent } from '../overlays/account-dialog/account-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { CreditsDialogComponent } from '../overlays/credits-dialog/credits-dialog.component';
import {
  FaqDialogComponent,
  FaqDialogData,
} from '../overlays/faq-dialog/faq-dialog.component';
import { FeedbackDialogComponent } from '../overlays/feedback-dialog/feedback-dialog.component';
import { ManageStateDialogComponent } from '../overlays/manage-state-dialog/manage-state-dialog.component';
import { PolicyDialogComponent } from '../overlays/policy-dialog/policy-dialog.component';
import {
  SimpleDialogComponent,
  SimpleDialogData,
} from '../overlays/simple-dialog/simple-dialog.component';
import { AnalyticsService } from './analytics.service';
import { AuthService } from './auth.service';
import { EventLogs } from './domain/event-logs';
import { LocalStorageService } from './local-storage.service';
import { TutorialService } from './tutorial.service';

@Injectable()
export class HudService {

  constructor(private dialog: MatDialog,
              private tutorialService: TutorialService,
              private analyticsService: AnalyticsService,
              private authService: AuthService,
              private localStorageService: LocalStorageService) {
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
      'ISRU Mining Station',
      Icons.Ore,
      {route: UsableRoutes.MiningStation},
      'Solves and balances the requirements of a mining base'),

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
      !this.localStorageService.hasViewedPrivacyPolicy(),
      () => this.localStorageService.setPrivacyPolicyViewed()),
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
            return;
          }

          if (user?.isCustomer === false) {
            this.analyticsService.logEvent('Call coffee dialog from Edit Universe', {category: EventLogs.Category.Coffee});
            this.dialog.open(BuyMeACoffeeDialogComponent);
            return;
          }
        },
      },
    );
  }

  createActionOptionTutorial(gameStateType: GameStateType,
                             onBeforeCallback?: () => Promise<unknown>): ActionOption {
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
            .subscribe(() => this.tutorialService.startFullTutorial(
              gameStateType,
              onBeforeCallback));
        },
      },
      undefined,
      !this.localStorageService.hasViewedTutorial(),
      () => this.localStorageService.setTutorialViewed());
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

  createActionResetPage(description: string, actionCallback: () => Promise<void>) {
    return new ActionOption(
      'Reset',
      Icons.DeleteAll,
      {
        action: async () => {
          let dialog$ = this.dialog.open(SimpleDialogComponent, {
            data: {
              title: 'Reset This Calculator',
              descriptions: [description],
              okButtonText: 'Reset',
            } as SimpleDialogData,
          });
          let result = await firstValueFrom(dialog$.afterClosed());
          if (!result) {
            return;
          }
          await actionCallback();

          this.analyticsService.logEvent('Used reset state', {
            category: EventLogs.Category.State,
          });
        },
      },
    );
  }
}
