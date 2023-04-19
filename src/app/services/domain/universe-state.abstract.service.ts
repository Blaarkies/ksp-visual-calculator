import { AbstractBaseStateService } from './base-state.abstract.service';
import { StateSpaceObject } from '../json-interfaces/state-space-object';
import { StateUniverse } from '../json-interfaces/state-universe';
import { AbstractUniverseBuilderService } from './universe-builder.abstract.service';

export abstract class AbstractUniverseStateService extends AbstractBaseStateService {

  protected abstract universeBuilderService: AbstractUniverseBuilderService;

  get state(): StateUniverse {
    let state = super.state;
    let planets = this.universeBuilderService.planets$.value;
    return {
      ...state,
      celestialBodies: planets?.map(b => b.toJson()) as StateSpaceObject[],
    };
  }

}
