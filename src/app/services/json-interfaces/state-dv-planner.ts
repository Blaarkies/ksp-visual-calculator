import { StateGame } from './state-game';
import { StateCheckpoint } from './state-checkpoint';

export interface StateDvPlanner extends StateGame {
  checkpoints: StateCheckpoint[];
}

