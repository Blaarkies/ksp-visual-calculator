import { Component } from '@angular/core';
import { WithDestroy } from '../../common/with-destroy';
import { HudService } from '../../services/hud.service';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { TravelService } from './services/travel.service';
import { CommonModule } from '@angular/common';
import { MissionJourneyComponent } from '../../components/mission-journey/mission-journey.component';
import { GameStateType } from '../../common/domain/game-state-type';
import {
  ActionPanelDetails,
  HudComponent,
} from '../../components/hud/hud.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ZoomIndicatorComponent } from '../../components/zoom-indicator/zoom-indicator.component';
import { FocusJumpToPanelComponent } from '../../components/focus-jump-to-panel/focus-jump-to-panel.component';
import { ManeuverSequencePanelComponent } from '../../components/maneuver-sequence-panel/maneuver-sequence-panel.component';
import { Icons } from '../../common/domain/icons';
import { DvStateService } from './services/dv-state.service';

@Component({
  selector: 'cp-page-dv-planner',
  standalone: true,
  imports: [
    CommonModule,
    UniverseMapComponent,
    MissionJourneyComponent,
    HudComponent,
    ZoomIndicatorComponent,
    FocusJumpToPanelComponent,
    ManeuverSequencePanelComponent,

    MatBottomSheetModule,
  ],
  templateUrl: './page-dv-planner.component.html',
  styleUrls: ['./page-dv-planner.component.scss', '../temp.calculators.scss'],
})
export class PageDvPlannerComponent extends WithDestroy() {

  icons = Icons;
  checkpoints$ = this.travelService.checkpoints$.asObservable();
  isSelectingCheckpoint$ = this.travelService.isSelectingCheckpoint$.asObservable();
  contextPanelDetails: ActionPanelDetails;

  constructor(
    private hudService: HudService,
    private dvStateService: DvStateService,
    private travelService: TravelService) {
    super();
    super.ngOnDestroy = () => {
      // workaround, error NG2007: Class is using Angular features but is not decorated.
      super.ngOnDestroy();
      this.travelService.unsubscribeFromComponent();
    };

    this.contextPanelDetails = this.getContextPanelDetails();
  }

  private getContextPanelDetails(): ActionPanelDetails {
    let options = [
      this.hudService.createActionOptionTutorial(),
      this.hudService.createActionOptionManageSaveGames(GameStateType.DvPlanner),
      this.hudService.createActionOptionFaq(GameStateType.DvPlanner),
    ];

    return {
      startTitle: 'Delta-v Planner',
      startIcon: Icons.OpenDetails,
      color: 'orange',
      options,
    };
  }

  selectCheckpoint(spaceObject: SpaceObject) {
    this.travelService.selectCheckpoint(spaceObject);
  }

}
