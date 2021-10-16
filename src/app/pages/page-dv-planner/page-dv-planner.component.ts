import { Component, ViewChild } from '@angular/core';
import { UsableRoutes } from '../../usable-routes';
import { takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { HudService } from '../../services/hud.service';
import { StateService } from '../../services/state.service';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { MissionDestination } from '../../components/maneuver-sequence-panel/maneuver-sequence-panel.component';
import { Observable } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { SpaceObjectContainerService } from '../../services/space-object-container.service';

@Component({
  selector: 'cp-page-dv-planner',
  templateUrl: './page-dv-planner.component.html',
  styleUrls: ['./page-dv-planner.component.scss'],
})
export class PageDvPlannerComponent extends WithDestroy() {

  @ViewChild('universeMap') universeMap: UniverseMapComponent;

  missionDestinations$: Observable<MissionDestination[]>;
  isSelectingDestination$: Observable<boolean>;

  constructor(hudService: HudService,
              stateService: StateService,
              private travelService: TravelService,
              spaceObjectContainerService: SpaceObjectContainerService) {
    super();

    hudService.setPageContext(UsableRoutes.DvPlanner);
    stateService.pageContext = UsableRoutes.DvPlanner;
    stateService.loadState().pipe(takeUntil(this.destroy$)).subscribe();

    this.missionDestinations$ = travelService.missionDestinations$.asObservable();
    this.isSelectingDestination$ = travelService.isSelectingDestination$.asObservable();

    // setTimeout(() => {
    //   this.travelService.addMissionDestination();
    //   this.selectDestination(spaceObjectContainerService.celestialBodies$.value.find(b => b.label.like('kerbin')));
    //
    //   this.travelService.addMissionDestination();
    //   this.selectDestination(spaceObjectContainerService.celestialBodies$.value.find(b => b.label.like('mun')));
    // }, 300);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.travelService.unsubscribeFromComponent();
  }

  selectDestination(spaceObject: SpaceObject) {
    this.travelService.selectDestination(spaceObject);
  }

  addMissionDestination() {
    this.travelService.addMissionDestination();
  }

  resetMission() {
    this.travelService.resetMission();
  }

  removeMissionDestination(missionDestination: MissionDestination) {
    this.travelService.removeMissionDestination(missionDestination);
  }

  updateMissionDestination(missionDestination: MissionDestination) {
    this.travelService.updateMissionDestination(missionDestination);
  }

}
