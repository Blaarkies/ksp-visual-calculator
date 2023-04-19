import { StateBase } from './state-base';
import { StateSpaceObject } from './state-space-object';

export interface StateUniverse extends StateBase {
  settings?: {
    difficulty?: {};
    preferences?: {};
  };
  celestialBodies: StateSpaceObject[];
}
