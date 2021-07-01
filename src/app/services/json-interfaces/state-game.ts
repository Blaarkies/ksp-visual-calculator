import { StateSpaceObject } from './state-space-object';

export interface StateGame {
  name: string;
  timestamp: Date;
  context: string;
  version: number[];
  settings: any;
  celestialBodies: StateSpaceObject[];
}
