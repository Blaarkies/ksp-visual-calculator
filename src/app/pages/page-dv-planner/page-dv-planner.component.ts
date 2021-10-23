import { Component, ViewChild } from '@angular/core';
import { UsableRoutes } from '../../usable-routes';
import { takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { HudService } from '../../services/hud.service';
import { StateService } from '../../services/state.service';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Observable } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { SpaceObjectContainerService } from '../../services/space-object-container.service';
import { Checkpoint } from '../../common/data-structures/delta-v-map/checkpoint';
import { CheckpointPreferences } from '../../common/domain/checkpoint-preferences';

@Component({
  selector: 'cp-page-dv-planner',
  templateUrl: './page-dv-planner.component.html',
  styleUrls: ['./page-dv-planner.component.scss'],
})
export class PageDvPlannerComponent extends WithDestroy() {

  @ViewChild('universeMap') universeMap: UniverseMapComponent;

  checkpoints$: Observable<Checkpoint[]>;
  isSelectingCheckpoint$: Observable<boolean>;

  constructor(hudService: HudService,
              stateService: StateService,
              private travelService: TravelService,
              spaceObjectContainerService: SpaceObjectContainerService) {
    super();
    super.ngOnDestroy = () => {
      // workaround, error NG2007: Class is using Angular features but is not decorated.
      super.ngOnDestroy();
      this.travelService.unsubscribeFromComponent();
    };

    hudService.setPageContext(UsableRoutes.DvPlanner);
    stateService.pageContext = UsableRoutes.DvPlanner;
    stateService.loadState().pipe(takeUntil(this.destroy$)).subscribe();

    this.checkpoints$ = travelService.checkpoints$.asObservable();
    this.isSelectingCheckpoint$ = travelService.isSelectingCheckpoint$.asObservable();

    setTimeout(() => {
      let addCheckpoint = name => {
        // this.travelService.addMissionDestination();
        // this.selectDestination(spaceObjectContainerService.celestialBodies$.value.find(b => b.label.like(name)));
      };

      addCheckpoint('kerbin');
      addCheckpoint('mun');
      addCheckpoint('duna');
      addCheckpoint('eve');
      addCheckpoint('moho');
    }, 300);
  }

  selectCheckpoint(spaceObject: SpaceObject) {
    this.travelService.selectCheckpoint(spaceObject);
  }

  addCheckpoint() {
    this.travelService.addCheckpoint();
  }

  resetMission() {
    this.travelService.resetCheckpoints();
  }

  removeCheckpoint(missionDestination: Checkpoint) {
    this.travelService.removeCheckpoint(missionDestination);
  }

  updateCheckpoint(missionDestination: Checkpoint) {
    this.travelService.updateCheckpoint(missionDestination);
  }

  updatePreferences(newPreferences: CheckpointPreferences) {
    this.travelService.updatePreferences(newPreferences);
  }

}
