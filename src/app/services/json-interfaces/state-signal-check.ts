import { StateCraft } from './state-craft';
import { StateGame } from './state-game';

export interface StateSignalCheck extends StateGame {
  craft: StateCraft[];
}

