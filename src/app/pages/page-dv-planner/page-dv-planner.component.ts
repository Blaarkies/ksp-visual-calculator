import { Component, ViewChild } from '@angular/core';
import { WithDestroy } from '../../common/with-destroy';
import { HudService } from '../../services/hud.service';
import { StateService } from '../../services/state.service';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { TravelService } from '../../services/travel.service';
import { takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MissionJourneyComponent } from '../../components/mission-journey/mission-journey.component';
import { UsableRoutes } from '../../app.routes';
import { GameStateType } from '../../common/domain/game-state-type';
import { HudComponent } from '../../components/hud/hud.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'cp-page-dv-planner',
  standalone: true,
  imports: [
    CommonModule,
    UniverseMapComponent,
    MissionJourneyComponent,
    HudComponent,

    MatBottomSheetModule,
  ],
  templateUrl: './page-dv-planner.component.html',
  styleUrls: ['./page-dv-planner.component.scss', '../temp.calculators.scss'],
})
export class PageDvPlannerComponent extends WithDestroy() {

  @ViewChild('universeMap') universeMap: UniverseMapComponent;

  checkpoints$ = this.travelService.checkpoints$.asObservable();
  isSelectingCheckpoint$ = this.travelService.isSelectingCheckpoint$.asObservable();

  constructor(hudService: HudService,
              stateService: StateService,
              private travelService: TravelService) {
    super();
    super.ngOnDestroy = () => {
      // workaround, error NG2007: Class is using Angular features but is not decorated.
      super.ngOnDestroy();
      this.travelService.unsubscribeFromComponent();
    };

    hudService.setPageContext(UsableRoutes.DvPlanner);
    stateService.pageContext = GameStateType.DvPlanner;
    stateService.loadState().pipe(takeUntil(this.destroy$)).subscribe();
  }

  selectCheckpoint(spaceObject: SpaceObject) {
    this.travelService.selectCheckpoint(spaceObject);
  }

}
