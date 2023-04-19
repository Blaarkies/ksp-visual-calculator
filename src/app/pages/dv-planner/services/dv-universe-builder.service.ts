import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { CheckpointPreferences } from '../../../common/domain/checkpoint-preferences';
import { OrbitParameterData } from '../../../common/domain/space-objects/orbit-parameter-data';
import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { SpaceObjectType } from '../../../common/domain/space-objects/space-object-type';
import { SubjectHandle } from '../../../common/subject-handle';
import { StockEntitiesCacheService } from '../../../services/stock-entities-cache.service';
import { StateDvPlanner } from '../../../services/json-interfaces/state-dv-planner';
import { StateSpaceObject } from '../../../services/json-interfaces/state-space-object';
import { AbstractUniverseBuilderService } from '../../../services/domain/universe-builder.abstract.service';
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

    private travelService: TravelService,
  ) {
    super();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    super.destroy();

    this.travelService.resetCheckpoints();
  }

  protected async setDetails() {
    await super.setDetails();
    this.travelService.resetCheckpoints();
  }

  protected async buildContextState(lastState: string) {
    let state: StateDvPlanner = JSON.parse(lastState);
    let {celestialBodies: jsonCelestialBodies, checkpoints: jsonCheckpoints} = state;

    let orbitsLabelMap = this.makeOrbitsLabelMap(jsonCelestialBodies);

    let bodies = jsonCelestialBodies.filter(json => [
      SpaceObjectType.types.star,
      SpaceObjectType.types.planet,
      SpaceObjectType.types.moon].includes(json.type))
      // TODO: extend SpaceObject to SpaceObjectTransmitters
      .map(b => [SpaceObject.fromJson(b, () => null), b]);

    let bodiesChildrenMap = new Map<string, SpaceObject>([
      ...bodies.map(([b]: [SpaceObject]) => [b.label, b])] as any);
    bodies.forEach(([b, json]: [SpaceObject, StateSpaceObject]) => {
      let matchingOrbit = orbitsLabelMap.get(json.draggableHandle.label);
      if (matchingOrbit) {
        b.draggableHandle.addOrbit(matchingOrbit);
      } else {
        b.draggableHandle.parameterData = new OrbitParameterData(json.draggableHandle.location);
        b.draggableHandle.updateConstrainLocation(OrbitParameterData.fromJson(b.draggableHandle.parameterData));
      }

      b.draggableHandle.setChildren(
        json.draggableHandle.children
          .map(c => bodiesChildrenMap.get(c)));

      if (json.draggableHandle.orbit) {
        let parameters = OrbitParameterData.fromJson(json.draggableHandle.orbit.parameters);
        b.draggableHandle.updateConstrainLocation(parameters);
      }
    });
    this.planets$.next(bodies.map(([b]: [SpaceObject]) => b));

    let getBodyByLabel = (label: string) => this.planets$.value.find(b => b.label.like(label));
    this.travelService.buildState(jsonCheckpoints, getBodyByLabel);
  }

  updateCheckpointPreferences(details: CheckpointPreferences) {
    this.checkpointPreferences$.set(details);
    this.travelService.updateCheckpointPreferences(details);
  }

}
