import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Craft } from '../../common/domain/space-objects/craft';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { BasicAnimations } from '../../animations/basic-animations';
import { SpaceObjectService } from '../../services/space-object.service';
import {
  filter,
  map,
  Observable,
  takeUntil,
} from 'rxjs';
import {
  CraftDetailsDialogComponent,
  CraftDetailsDialogData,
} from '../../overlays/craft-details-dialog/craft-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from '../../services/analytics.service';
import { WithDestroy } from '../../common/with-destroy';
import { Icons } from '../../common/domain/icons';
import { StateService } from '../../services/state.service';
import { HudService } from '../../services/hud.service';
import { GlobalStyleClass } from '../../common/global-style-class';
import { EventLogs } from '../../services/domain/event-logs';
import { CommonModule } from '@angular/common';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { TransmissionLineComponent } from '../../components/transmission-line/transmission-line.component';
import {
  DraggableSpaceObjectComponent,
} from '../../components/draggable-space-object/draggable-space-object.component';
import { UsableRoutes } from '../../app.routes';
import { GameStateType } from '../../common/domain/game-state-type';
import {
  ActionPanelDetails,
  HudComponent,
} from '../../components/hud/hud.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ActionOption } from '../../common/domain/action-option';
import { DifficultySettingsDialogComponent } from '../../overlays/difficulty-settings-dialog/difficulty-settings-dialog.component';
import { SetupService } from '../../services/setup.service';
import { ZoomIndicatorComponent } from '../../components/zoom-indicator/zoom-indicator.component';
import { FocusJumpToPanelComponent } from '../../components/focus-jump-to-panel/focus-jump-to-panel.component';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'cp-commnet-planner',
  standalone: true,
  imports: [
    CommonModule,
    UniverseMapComponent,
    TransmissionLineComponent,
    DraggableSpaceObjectComponent,
    HudComponent,

    MatBottomSheetModule,
    ZoomIndicatorComponent,
    FocusJumpToPanelComponent,
  ],
  templateUrl: './page-commnet-planner.component.html',
  styleUrls: ['./page-commnet-planner.component.scss', '../temp.calculators.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [BasicAnimations.fade],
})
export class PageCommnetPlannerComponent extends WithDestroy() {

  icons = Icons;
  transmissionLines$: Observable<TransmissionLine[]>;
  crafts$: Observable<Craft[]>;

  contextPanelDetails: ActionPanelDetails;
  focusables$: Observable<SpaceObject[]>;

  constructor(private cdr: ChangeDetectorRef,
              private spaceObjectService: SpaceObjectService,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService,
              private hudService: HudService,
              private setupService: SetupService,
              private stateService: StateService,
  ) {
    super();

    this.contextPanelDetails = this.getContextPanelDetails();

    this.transmissionLines$ = this.spaceObjectService.transmissionLines$;
    this.crafts$ = this.spaceObjectService.crafts$;

    this.focusables$ = combineLatest([
      this.crafts$,
      this.spaceObjectService.celestialBodies$,
    ]).pipe(
      filter(([craft, planets]) => !!craft && !!planets),
      map(lists => lists.flatMap() as SpaceObject[]),
    );
  }

  private getContextPanelDetails(): ActionPanelDetails {
    let options = [
      new ActionOption('New Craft', Icons.Craft, {
        action: () => {
          this.analyticsService.logEventThrottled(EventLogs.Name.CallNewCraftDialog, {
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
              takeUntil(this.destroy$))
            .subscribe(craftDetails => {
              this.spaceObjectService.addCraftToUniverse(craftDetails);
              // this.cdr.tick();
            });
        },
      }),
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
              takeUntil(this.destroy$))
            .subscribe(details => {
              this.setupService.updateDifficultySetting(details);
              // this.cdr.tick();
              // todo: refresh universe, because 0 strength transmission lines are still visible
            });
        },
      }),
      this.hudService.createActionOptionTutorial(),
      this.hudService.createActionOptionManageSaveGames({
        context: GameStateType.CommnetPlanner,
        contextTitle: 'CommNet Planner',
        stateHandler: this.stateService as any,
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
    // todo: check if children in SOI feature have antennae
    if (dragged.antennae?.length) {
      this.spaceObjectService.updateTransmissionLines();
    }
  }

  editCraft(craft: Craft) {
    this.analyticsService.logEvent('Start edit craft', {
      category: EventLogs.Category.Craft,
    });

    this.dialog.open(CraftDetailsDialogComponent, {
      data: {
        forbiddenNames: this.spaceObjectService.crafts$.value.map(c => c.label),
        edit: craft,
      } as CraftDetailsDialogData,
      backdropClass: GlobalStyleClass.MobileFriendly,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        takeUntil(this.destroy$))
      .subscribe(details => {
        this.spaceObjectService.editCraft(craft, details);
        this.cdr.markForCheck();
      });
  }

}
