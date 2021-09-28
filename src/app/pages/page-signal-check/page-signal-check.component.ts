import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Craft } from '../../common/domain/space-objects/craft';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { SpaceObjectService } from '../../services/space-object.service';
import { Observable } from 'rxjs';
import {
  CraftDetailsDialogComponent,
  CraftDetailsDialogData
} from '../../overlays/craft-details-dialog/craft-details-dialog.component';
import { filter, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from '../../services/analytics.service';
import { WithDestroy } from '../../common/with-destroy';
import { Icons } from '../../common/domain/icons';
import { StateService } from '../../services/state.service';
import { UsableRoutes } from '../../usable-routes';
import { HudService } from '../../services/hud.service';
import { GlobalStyleClass } from '../../common/GlobalStyleClass';
import { EventLogs } from '../../services/event-logs';

@Component({
  selector: 'cp-page-signal-check',
  templateUrl: './page-signal-check.component.html',
  styleUrls: ['./page-signal-check.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [CustomAnimation.animateFade],
})
export class PageSignalCheckComponent extends WithDestroy() {

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

    hudService.pageContext = UsableRoutes.SignalCheck;
    stateService.pageContext = UsableRoutes.SignalCheck;
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
