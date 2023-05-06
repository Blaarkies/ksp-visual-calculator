import { StateContextual } from './state-contextual';
import { StateSpaceObject } from './state-space-object';

export interface StateUniverse extends StateContextual {
  celestialBodies: StateSpaceObject[];
}
