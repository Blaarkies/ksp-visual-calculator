import { StateUniverseDto } from './state-universe.dto';
import { CheckpointDto } from './checkpoint-dto';

export interface StateDvPlannerDto extends StateUniverseDto {
  settings?: {
    preferences?: {};
  };
  checkpoints: CheckpointDto[];
}

