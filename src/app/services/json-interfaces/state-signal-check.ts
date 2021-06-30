import { StateCraft } from './state-craft';
import { StateSpaceObject } from './state-space-object';

export interface StateSignalCheck {
  context: string;
  version: number[];
  settings: any;
  celestialBodies: StateSpaceObject[];
  craft: StateCraft[];
}
