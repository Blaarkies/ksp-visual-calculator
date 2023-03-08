import { StateCraft } from './state-craft';
import { StateGame } from './state-game';

export interface StateCommnetPlanner extends StateGame {
  craft: StateCraft[];
}

