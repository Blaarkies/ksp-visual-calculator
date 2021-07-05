import { StateSpaceObject } from './state-space-object';

export interface StateGame {
  name: string;
  timestamp: Date;
  context: string;
  version: number[];
  settings: {
    difficulty: {};
  };
  celestialBodies: StateSpaceObject[];
}
