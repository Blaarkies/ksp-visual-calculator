import { AbstractBaseStateService } from './base-state.abstract.service';
import { StateSpaceObject } from '../json-interfaces/state-space-object';
import { StateUniverse } from '../json-interfaces/state-universe';
import { AbstractUniverseBuilderService } from './universe-builder.abstract.service';

export abstract class AbstractUniverseStateService extends AbstractBaseStateService {

  protected abstract universeBuilderService: AbstractUniverseBuilderService;

  get stateContextual(): StateUniverse {
    let planets = this.universeBuilderService.planets$.value;
    return {
      celestialBodies: planets?.map(b => b.toJson()) as StateSpaceObject[],
    };
  }

}
