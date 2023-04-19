import { StateCraft } from './state-craft';
import { StateUniverse } from './state-universe';

export interface StateCommnetPlanner extends StateUniverse {
  craft: StateCraft[];
}

