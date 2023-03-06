import { Injectable } from '@angular/core';
import { AbstractUniverseBuilderService } from '../../../services/universe-builder.abstract.service';
import { StateDvPlanner } from '../../../services/json-interfaces/state-dv-planner';
import { SpaceObjectType } from '../../../common/domain/space-objects/space-object-type';
import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { StateSpaceObject } from '../../../services/json-interfaces/state-space-object';
import { OrbitParameterData } from '../../../common/domain/space-objects/orbit-parameter-data';
import { TravelService } from './travel.service';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { SetupService } from 'src/app/services/setup.service';
import { SpaceObjectContainerService } from '../../../services/space-object-container.service';

@Injectable({
  providedIn: 'any',
})
export class DvUniverseBuilderService extends AbstractUniverseBuilderService {

  celestialBodies$ = this.spaceObjectContainerService.celestialBodies$;

  constructor(
    protected setupService: SetupService,
    protected analyticsService: AnalyticsService,
    protected spaceObjectContainerService: SpaceObjectContainerService,

    private travelService: TravelService,
  ) {
    super();
  }

  protected setDetails() {
    super.setDetails();
    this.travelService.resetCheckpoints();
  }

  protected buildContextState(lastState: string) {
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
    this.celestialBodies$.next(bodies.map(([b]: [SpaceObject]) => b));

    let getBodyByLabel = (label: string) => this.celestialBodies$.value.find(b => b.label.like(label));
    this.travelService.buildState(jsonCheckpoints, getBodyByLabel);
  }

}
