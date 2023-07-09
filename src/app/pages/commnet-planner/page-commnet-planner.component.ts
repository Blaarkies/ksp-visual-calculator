import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  combineLatest,
  delayWhen,
  filter,
  firstValueFrom,
  map,
  merge,
  Observable,
  startWith,
  take,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { ActionOption } from '../../common/domain/action-option';
import { AntennaSignal } from '../../common/domain/antenna.signal';
import { GameStateType } from '../../common/domain/game-state-type';
import { Icons } from '../../common/domain/icons';
import { Craft } from '../../common/domain/space-objects/craft';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { GlobalStyleClass } from '../../common/global-style-class';
import { WithDestroy } from '../../common/with-destroy';
import { DraggableSpaceObjectComponent } from '../../components/draggable-space-object/draggable-space-object.component';
import { FocusJumpToPanelComponent } from '../../components/focus-jump-to-panel/focus-jump-to-panel.component';
import { ActionPanelDetails } from '../../components/hud/action-panel-details';
import { HudComponent } from '../../components/hud/hud.component';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { ZoomIndicatorComponent } from '../../components/zoom-indicator/zoom-indicator.component';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { EventLogs } from '../../services/domain/event-logs';
import { AbstractUniverseBuilderService } from '../../services/domain/universe-builder.abstract.service';
import { AbstractUniverseStateService } from '../../services/domain/universe-state.abstract.service';
import { GuidanceService } from '../../services/guidance.service';
import { HudService } from '../../services/hud.service';
import { AntennaSignalComponent } from './components/antenna-signal/antenna-signal.component';
import {
  CraftDetailsDialogComponent,
  CraftDetailsDialogData,
} from './components/craft-details-dialog/craft-details-dialog.component';
import { DifficultySettingsDialogComponent } from './components/difficulty-settings-dialog/difficulty-settings-dialog.component';
import { CommnetStateService } from './services/commnet-state.service';
import { CommnetUniverseBuilderService } from './services/commnet-universe-builder.service';

@Component({
  selector: 'cp-page-commnet-planner',
  standalone: true,
  imports: [
    CommonModule,
    HudComponent,
    ZoomIndicatorComponent,
    FocusJumpToPanelComponent,
    UniverseMapComponent,
    AntennaSignalComponent,
    DraggableSpaceObjectComponent,
  ],
  providers: [
    HudService,
    CommnetUniverseBuilderService,
    CommnetStateService,
    {provide: AbstractUniverseBuilderService, useExisting: CommnetUniverseBuilderService},
    {provide: AbstractUniverseStateService, useExisting: CommnetStateService},
  ],
  templateUrl: './page-commnet-planner.component.html',
  styleUrls: ['./page-commnet-planner.component.scss'],
  animations: [BasicAnimations.fade],
})
export default class PageCommnetPlannerComponent extends WithDestroy() implements OnDestroy {

  icons = Icons;
  contextPanelDetails: ActionPanelDetails;
  signals$: Observable<AntennaSignal[]>;
  crafts$: Observable<Craft[]>;
  orbits$: Observable<Orbit[]>;
  planets$: Observable<SpaceObject[]>;
  focusables$: Observable<SpaceObject[]>;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private analyticsService: AnalyticsService,
    private hudService: HudService,
    private commnetStateService: CommnetStateService,
    private commnetUniverseBuilderService: CommnetUniverseBuilderService,
    guidanceService: GuidanceService,
    ) {
    super();

    this.contextPanelDetails = this.getContextPanelDetails();

    let universe = commnetUniverseBuilderService;
    this.signals$ = universe.signals$.stream$;
    this.crafts$ = universe.craft$.stream$;
    this.orbits$ = universe.orbits$;
    this.planets$ = universe.planets$;

    this.focusables$ = combineLatest([this.crafts$.pipe(startWith([])), this.planets$])
      .pipe(
        filter(([craft, planets]) => !!craft && !!planets),
        map(lists => lists.flatMap() as SpaceObject[]));

    merge(
      this.authService.user$.pipe(take(1)),
      this.authService.signIn$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => this.commnetStateService.handleUserSingIn(u));

    guidanceService.openTutorialDialog(GameStateType.CommnetPlanner);
    guidanceService.setSupportDeveloperSnackbar(this.destroy$);
    guidanceService.setSignUpDialog(this.destroy$);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.commnetStateService.destroy();
  }

  private getContextPanelDetails(): ActionPanelDetails {
    let options = [
      new ActionOption('New Craft', Icons.Craft, {
        action: () => {
          this.analyticsService.logEventThrottled(EventLogs.Name.CallNewCraftDialog, {
            category: EventLogs.Category.Craft,
          });

          let allCraft = this.commnetUniverseBuilderService.craft$.value;
          this.dialog.open(CraftDetailsDialogComponent, {
            data: {
              forbiddenNames: allCraft.map(c => c.label),
              universeBuilderHandler: this.commnetUniverseBuilderService,
            } as CraftDetailsDialogData,
            backdropClass: GlobalStyleClass.MobileFriendly,
          })
            .afterClosed()
            .pipe(
              filter(craftDetails => craftDetails),
              delayWhen(craftDetails => this.commnetUniverseBuilderService.addCraftToUniverse(craftDetails)),
              takeUntil(this.destroy$))
            .subscribe();
        },
      }),
      new ActionOption('Difficulty Settings', Icons.Difficulty, {
        action: () => {
          this.analyticsService.logEvent('Call difficulty settings dialog', {
            category: EventLogs.Category.Difficulty,
          });

          this.dialog.open(DifficultySettingsDialogComponent,
            {data: this.commnetUniverseBuilderService.difficultySetting})
            .afterClosed()
            .pipe(
              filter(details => details),
              takeUntil(this.destroy$))
            .subscribe(details =>
              this.commnetUniverseBuilderService.updateDifficultySetting(details));
        },
      }),
      this.hudService.createActionOptionTutorial(GameStateType.CommnetPlanner,
        () => firstValueFrom(this.commnetUniverseBuilderService.buildStockState())),
      this.hudService.createActionOptionManageSaveGames(ref => {
          let component = ref.componentInstance;
          component.context = GameStateType.CommnetPlanner;
          component.contextTitle = 'CommNet Planner';
          component.stateHandler = this.commnetStateService;
        },
      ),
      this.hudService.createActionResetPage(
        'This will reset the universe and remove all craft',
        async () => {
          await firstValueFrom(this.commnetUniverseBuilderService.buildStockState());
          await this.commnetStateService.save();
        }),
      this.hudService.createActionOptionFaq(GameStateType.CommnetPlanner),
    ];

    return {
      startTitle: 'CommNet Planner',
      startIcon: Icons.OpenDetails,
      color: 'orange',
      options,
    };
  }

  updateUniverse(dragged: SpaceObject) {
    // TODO: check if children in SOI feature have antennae
    if (dragged.antennae?.length) {
      this.commnetUniverseBuilderService.updateTransmissionLines();
    }
  }

  editCraft(craft: Craft) {
    this.analyticsService.logEvent('Start edit craft', {
      category: EventLogs.Category.Craft,
    });

    let allCraft = this.commnetUniverseBuilderService.craft$.value;
    this.dialog.open(CraftDetailsDialogComponent, {
      data: {
        forbiddenNames: allCraft.map(c => c.label),
        edit: craft,
        universeBuilderHandler: this.commnetUniverseBuilderService,
      } as CraftDetailsDialogData,
      backdropClass: GlobalStyleClass.MobileFriendly,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        delayWhen(details => this.commnetUniverseBuilderService.editCraft(craft, details)),
        takeUntil(this.destroy$))
      .subscribe();
  }

  editPlanet({body, details}) {
    this.commnetUniverseBuilderService.editCelestialBody(body, details);
    this.commnetUniverseBuilderService.updateTransmissionLines();
  }

  trackSignal(index: number, item: AntennaSignal): string {
    return item.nodes[0].label + item.nodes[1].label;
  }

}
