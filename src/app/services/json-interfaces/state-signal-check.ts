import { StateCraft } from './state-craft';
import { StateSpaceObject } from './state-space-object';

export interface StateSignalCheck extends StateGame {
  celestialBodies: StateSpaceObject[];
  craft: StateCraft[];
}

export interface StateGame {
  name: string;
  timestamp: Date;
  context: string;
  version: number[];
  settings: any;
}
