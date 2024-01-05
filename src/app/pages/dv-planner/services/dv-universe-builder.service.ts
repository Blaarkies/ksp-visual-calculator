import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import { Planetoid } from 'src/app/common/domain/space-objects/planetoid';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { CheckpointPreferences } from '../../../common/domain/checkpoint-preferences';
import { StateDvPlannerDto } from '../../../common/domain/dtos/state-dv-planner.dto';
import { OrbitParameterData } from '../../../common/domain/space-objects/orbit-parameter-data';
import { SubjectHandle } from '../../../common/subject-handle';
import { CameraService } from '../../../services/camera.service';
import { EnrichedStarSystem } from '../../../services/domain/enriched-star-system.model';
import { AbstractUniverseBuilderService } from '../../../services/domain/universe-builder.abstract.service';
import { StockEntitiesCacheService } from '../../../services/stock-entities-cache.service';
import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
import { TravelService } from './travel.service';

@Injectable()
export class DvUniverseBuilderService extends AbstractUniverseBuilderService implements OnDestroy {

  checkpointPreferences$ = new SubjectHandle<CheckpointPreferences>(
    {defaultValue: CheckpointPreferences.default});

  constructor(
    protected universeContainerInstance: UniverseContainerInstance,
    protected analyticsService: AnalyticsService,
    protected cacheService: StockEntitiesCacheService,
    protected cameraService: CameraService,

    private travelService: TravelService,
  ) {
    super();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    super.destroy();

    this.travelService.resetCheckpoints();
  }

  protected async setDetails(enrichedStarSystem: EnrichedStarSystem) {
    this.travelService.resetCheckpoints();
    this.checkpointPreferences$.set(CheckpointPreferences.default);
  }

  protected override async buildContextState(lastState: string) {
    await super.buildContextState(lastState);

    let state: StateDvPlannerDto = JSON.parse(lastState);
    let {planetoids, checkpoints: jsonCheckpoints} = state;

    let planetoidDtoPairs = planetoids.map(dto => ({planetoid: Planetoid.fromJson(dto), dto}));
    let orbitsLabelMap = this.makeOrbitsLabelMap(planetoidDtoPairs);

    let planetoidsChildrenMap = new Map<string, Planetoid>([
      ...planetoidDtoPairs.map(({planetoid}) => [planetoid.label, planetoid])] as any);
    planetoidDtoPairs.forEach(({planetoid, dto}) => {
      let matchingOrbit = orbitsLabelMap.get(dto.draggable.label);
      if (matchingOrbit) {
        planetoid.draggable.setOrbit(matchingOrbit);
      } else {
        planetoid.draggable.parameterData = new OrbitParameterData(dto.draggable.location);
        planetoid.draggable.updateConstrainLocation(OrbitParameterData.fromJson(planetoid.draggable.parameterData));
      }

      planetoid.draggable.setChildren(
        dto.draggable.children
          .map(c => planetoidsChildrenMap.get(c)));

      if (dto.orbit) {
        let parameters = OrbitParameterData.fromJson(dto.orbit.parameters);
        planetoid.draggable.updateConstrainLocation(parameters);
      }
    });
    this.planetoids$.next(planetoidDtoPairs.map(e => e.planetoid));

    let getBodyByLabel = (label: string) => this.planetoids$.value.find(b => b.label.like(label));
    this.travelService.buildState(jsonCheckpoints, getBodyByLabel);
  }

  updateCheckpointPreferences(details: CheckpointPreferences) {
    this.checkpointPreferences$.set(details);
    this.travelService.updateCheckpointPreferences(details);
  }

}
