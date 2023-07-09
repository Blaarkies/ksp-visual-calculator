import { StateCraft } from './state-craft';
import { StateUniverse } from './state-universe';

export interface StateCommnetPlanner extends StateUniverse {
  settings?: {
    difficulty?: {};
  };
  craft: StateCraft[];
}

