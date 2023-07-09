import { StateUniverse } from './state-universe';
import { StateCheckpoint } from './state-checkpoint';

export interface StateDvPlanner extends StateUniverse {
  settings?: {
    preferences?: {};
  };
  checkpoints: StateCheckpoint[];
}

