import { ApplicationRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ActionPanelDetails } from '../components/hud/hud.component';
import { UsableRoutes } from '../usable-routes';
import { ActionOption } from '../common/domain/action-option';
import { Icons } from '../common/domain/icons';
import { AnalyticsService } from './analytics.service';
import {
  CraftDetailsDialogComponent,
  CraftDetailsDialogData
} from '../overlays/craft-details-dialog/craft-details-dialog.component';
import { filter, map, startWith, take, takeUntil } from 'rxjs/operators';
import { DifficultySettingsDialogComponent } from '../overlays/difficulty-settings-dialog/difficulty-settings-dialog.component';
import {
  ManageStateDialogComponent,
  ManageStateDialogData
} from '../overlays/manage-state-dialog/manage-state-dialog.component';
import { AccountDialogComponent } from '../overlays/account-dialog/account-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SpaceObjectService } from './space-object.service';
import { SetupService } from './setup.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { SimpleDialogComponent, SimpleDialogData } from '../overlays/simple-dialog/simple-dialog.component';
import { PrivacyDialogComponent } from '../overlays/privacy-dialog/privacy-dialog.component';
import { CreditsDialogComponent } from '../overlays/credits-dialog/credits-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { FeedbackDialogComponent } from '../overlays/feedback-dialog/feedback-dialog.component';
import { TutorialService } from './tutorial.service';
import { GlobalStyleClass } from '../common/global-style-class';
import { EventLogs } from './event-logs';

@Injectable({
  providedIn: 'root',
})
export class HudService {

  contextPanel$ = new BehaviorSubject<ActionPanelDetails>(null);
  private contextChange$ = new BehaviorSubject<UsableRoutes>(null);
  context$ = this.contextChange$.asObservable();
  // fix dialog takeUntil using BehaviorSubject, because it cancels the stream immediately
  unsubscribeDialog$ = new Subject();

  get pageContext(): UsableRoutes {
    return this.contextChange$.value;
  }

  get pageContextChange$(): Observable<UsableRoutes> {
    return this.contextChange$.asObservable();
  }

  setPageContext(value: UsableRoutes) {
    this.contextChange$.next(value);
    let newPanel = this.getContextPanel(value);
    this.contextPanel$.next(newPanel);
    this.unsubscribeDialog$.next();
  }

  constructor(private dialog: MatDialog,
              private spaceObjectService: SpaceObjectService,
              private setupService: SetupService,
              private tutorialService: TutorialService,
              private cdr: ApplicationRef,
              private snackBar: MatSnackBar,
              private analyticsService: AnalyticsService,
              private authService: AuthService) {
  }

  private getContextPanel(context: UsableRoutes): ActionPanelDetails {
    switch (context) {
      case UsableRoutes.SignalCheck:
        return this.signalCheckPanel;
      case UsableRoutes.DvPlanner:
        return this.dvPlannerPanel;
      default:
        throw new Error(`No context panel for context "${context}"`);
    }
  }

  get navigationOptions(): ActionOption[] {
    return [
      new ActionOption(
        'Delta-v Planner',
        Icons.DeltaV,
        {route: UsableRoutes.DvPlanner},
        'Page that calculates the required delta-v for a specified mission'),
      new ActionOption(
        'Signal Check',
        Icons.Relay,
        {route: UsableRoutes.SignalCheck},
        'Page that calculates CommNet ranges'),
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
  }

  get infoOptions(): ActionOption[] {
    return [
      new ActionOption('Tutorial', Icons.Help, {
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
              .subscribe(() => this.tutorialService.startFullTutorial(this.pageContext));
          },
        },
        undefined,
        !localStorage.getItem('ksp-commnet-planner-tutorial-viewed'),
        () => localStorage.setItem('ksp-commnet-planner-tutorial-viewed', true.toString())),
      new ActionOption('Privacy', Icons.Analytics, {
          action: () => {
            this.analyticsService.logEvent('Call privacy dialog', {
              category: EventLogs.Category.Privacy,
            });

            this.dialog.open(PrivacyDialogComponent)
              .afterClosed()
              .subscribe();
          },
        },
        'View privacy statement and settings',
        !localStorage.getItem('ksp-commnet-planner-privacy-viewed'),
        () => localStorage.setItem('ksp-commnet-planner-privacy-viewed', true.toString())),
      new ActionOption('Credits', Icons.Credits, {
        action: () => {
          this.analyticsService.logEvent('Call Credits dialog', {
            category: EventLogs.Category.Credits,
          });

          this.dialog.open(CreditsDialogComponent)
            .afterClosed()
            .subscribe();
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
    ];
  }

  private get signalCheckPanel(): ActionPanelDetails {
    let options = [
      new ActionOption('New Craft', Icons.Craft, {
        action: () => {
          this.analyticsService.throttleEvent(EventLogs.Name.CallNewCraftDialog, {
            category: EventLogs.Category.Craft,
          });

          this.dialog.open(CraftDetailsDialogComponent, {
            data: {
              forbiddenNames: this.spaceObjectService.crafts$.value.map(c => c.label),
            } as CraftDetailsDialogData,
            backdropClass: GlobalStyleClass.MobileFriendly,
          })
            .afterClosed()
            .pipe(
              filter(craftDetails => craftDetails),
              takeUntil(this.unsubscribeDialog$))
            .subscribe(craftDetails => {
              this.spaceObjectService.addCraftToUniverse(craftDetails);
              this.cdr.tick();
            });
        },
      }),
      this.createActionOptionNewCelestialBody(),
      new ActionOption('Difficulty Settings', Icons.Difficulty, {
        action: () => {
          this.analyticsService.logEvent('Call difficulty settings dialog', {
            category: EventLogs.Category.Difficulty,
          });

          this.dialog.open(DifficultySettingsDialogComponent,
            {data: this.setupService.difficultySetting})
            .afterClosed()
            .pipe(
              filter(details => details),
              takeUntil(this.unsubscribeDialog$))
            .subscribe(details => {
              this.setupService.updateDifficultySetting(details);
              this.cdr.tick();
              // todo: refresh universe, because 0 strength transmission lines are still visible
            });
        },
      }),
      this.createActionOptionManageSaveGames(UsableRoutes.SignalCheck),
    ];

    return {
      startTitle: 'Signal Check',
      startIcon: Icons.OpenDetails,
      color: 'orange',
      options,
    };
  }

  private get dvPlannerPanel(): ActionPanelDetails {
    let options = [
      this.createActionOptionManageSaveGames(UsableRoutes.DvPlanner),
    ];

    return {
      startTitle: 'Delta-v Planner',
      startIcon: Icons.OpenDetails,
      color: 'orange',
      options,
    };
  }

  private createActionOptionNewCelestialBody() {
    return new ActionOption('New Celestial Body', Icons.Planet, {action: () => void 0}, undefined, false, undefined,
      {
        unavailable$: of(true),
        tooltip: 'Adding moons, planets, and stars are coming soon!',
        action: () => {
          this.analyticsService.logEvent('Call new celestial body dialog', {category: EventLogs.Category.CelestialBody});
          this.snackBar.open('Adding moons, planets, and stars are coming soon!');
        },
      });
  }

  private createActionOptionManageSaveGames(context: UsableRoutes) {
    return new ActionOption('Manage Save Games', Icons.Storage, {
        action: () => {
          this.analyticsService.logEvent('Call state dialog', {
            category: EventLogs.Category.State,
          });

          this.dialog.open(ManageStateDialogComponent, {
            data: {context} as ManageStateDialogData,
            backdropClass: GlobalStyleClass.MobileFriendly,
          });
        },
      }, undefined, false, undefined,
      {
        unavailable$: this.authService.user$.pipe(map(user => user === null || !user?.isCustomer), startWith(true)),
        tooltip: `Save games are only available after supporting on 'buymeacoffee.com/Blaarkies'`,
        action: async () => {
          let user = await this.authService.user$.pipe(take(1)).toPromise();

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
}
