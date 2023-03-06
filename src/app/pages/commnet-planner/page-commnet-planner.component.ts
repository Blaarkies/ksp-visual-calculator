import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Craft } from '../../common/domain/space-objects/craft';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { BasicAnimations } from '../../animations/basic-animations';
import { SpaceObjectService } from '../../services/space-object.service';
import { filter, Observable, takeUntil } from 'rxjs';
import {
  CraftDetailsDialogComponent,
  CraftDetailsDialogData
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
  DraggableSpaceObjectComponent
} from '../../components/draggable-space-object/draggable-space-object.component';
import { UsableRoutes } from '../../app.routes';
import { GameStateType } from '../../common/domain/game-state-type';
import { HudComponent } from '../../components/hud/hud.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

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
  ],
  templateUrl: './page-commnet-planner.component.html',
  styleUrls: ['./page-commnet-planner.component.scss', '../temp.calculators.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [BasicAnimations.fade],
})
export class PageCommnetPlannerComponent extends WithDestroy() {

  transmissionLines$: Observable<TransmissionLine[]>;
  crafts$: Observable<Craft[]>;

  icons = Icons;

  constructor(private cdr: ChangeDetectorRef,
              private spaceObjectService: SpaceObjectService,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService,
              hudService: HudService,
              stateService: StateService) {
    super();

    hudService.setPageContext(UsableRoutes.CommnetPlanner);
    stateService.pageContext = GameStateType.CommnetPlanner;
    stateService.loadState().pipe(takeUntil(this.destroy$)).subscribe();

    this.transmissionLines$ = this.spaceObjectService.transmissionLines$;
    this.crafts$ = this.spaceObjectService.crafts$;
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
