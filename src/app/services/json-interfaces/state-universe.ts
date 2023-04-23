import { StateBase } from './state-base';
import { StateContextual } from './state-contextual';
import { StateSpaceObject } from './state-space-object';

export interface StateUniverse extends StateContextual {
  settings?: {
    difficulty?: {};
    preferences?: {};
  };
  celestialBodies: StateSpaceObject[];
}
