import { CraftDto } from './craft-dto';
import { StateUniverseDto } from './state-universe.dto';

export interface StateCommnetPlannerDto extends StateUniverseDto {
  settings?: {
    difficulty?: {};
  };
  craft: CraftDto[];
}

