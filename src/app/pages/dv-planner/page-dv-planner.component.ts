import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
} from '@angular/core';
import {
  merge,
  Observable,
  take,
  takeUntil,
} from 'rxjs';
import { GameStateType } from '../../common/domain/game-state-type';
import { Icons } from '../../common/domain/icons';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { WithDestroy } from '../../common/with-destroy';
import { FocusJumpToPanelComponent } from '../../components/focus-jump-to-panel/focus-jump-to-panel.component';
import { ActionPanelDetails } from '../../components/hud/action-panel-details';
import { HudComponent } from '../../components/hud/hud.component';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { ZoomIndicatorComponent } from '../../components/zoom-indicator/zoom-indicator.component';
import { AuthService } from '../../services/auth.service';
import { HudService } from '../../services/hud.service';
import { AbstractStateService } from '../../services/state.abstract.service';
import { AbstractUniverseBuilderService } from '../../services/universe-builder.abstract.service';
import { ManeuverSequencePanelComponent } from './components/maneuver-sequence-panel/maneuver-sequence-panel.component';
import { MissionJourneyComponent } from './components/mission-journey/mission-journey.component';
import { DvStateService } from './services/dv-state.service';
import { DvUniverseBuilderService } from './services/dv-universe-builder.service';
import { TravelService } from './services/travel.service';

@Component({
  selector: 'cp-page-dv-planner',
  standalone: true,
  imports: [
    CommonModule,
    HudComponent,
    ZoomIndicatorComponent,
    FocusJumpToPanelComponent,
    UniverseMapComponent,
    MissionJourneyComponent,
    ManeuverSequencePanelComponent,
  ],
  providers: [
    HudService,
    DvUniverseBuilderService,
    DvStateService,
    {provide: AbstractUniverseBuilderService, useExisting: DvUniverseBuilderService},
    {provide: AbstractStateService, useExisting: DvStateService},
  ],
  templateUrl: './page-dv-planner.component.html',
  styleUrls: ['./page-dv-planner.component.scss', '../temp.calculators.scss'],
})
export default class PageDvPlannerComponent extends WithDestroy() implements OnDestroy {

  icons = Icons;
  checkpoints$ = this.travelService.checkpoints$.stream$;
  isSelectingCheckpoint$ = this.travelService.isSelectingCheckpoint$.asObservable();
  contextPanelDetails: ActionPanelDetails;
  orbits$: Observable<Orbit[]>;
  planets$: Observable<SpaceObject[]>;

  constructor(
    private authService: AuthService,
    private hudService: HudService,
    private dvStateService: DvStateService,
    private dvUniverseBuilderService: DvUniverseBuilderService,
    private travelService: TravelService,
  ) {
    super();

    this.contextPanelDetails = this.getContextPanelDetails();

    let universe = dvUniverseBuilderService;
    this.orbits$ = universe.orbits$;
    this.planets$ = universe.planets$;

    merge(
      this.authService.user$.pipe(take(1)),
      this.authService.signIn$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => this.dvStateService.handleUserSingIn(u));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.travelService.unsubscribeFromComponent();
  }

  private getContextPanelDetails(): ActionPanelDetails {
    let options = [
      this.hudService.createActionOptionTutorial(GameStateType.DvPlanner),
      this.hudService.createActionOptionManageSaveGames(ref => {
          let component = ref.componentInstance;
          component.context = GameStateType.DvPlanner;
          component.contextTitle = 'Delta-v Planner';
          component.stateHandler = this.dvStateService;
        },
      ),
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

  editPlanet({body, details}) {
    this.dvUniverseBuilderService.editCelestialBody(body, details);
  }
}
