import { StateContextualDto } from '../../../common/domain/dtos/state-contextual.dto';
import { CraftPartDto } from '../../../common/domain/dtos/craft-part.dto';

export interface StateIsruDto extends StateContextualDto {
  landed: boolean;
  planet?: string;
  distanceFromStar?: number;
  oreConcentration: number;
  engineerBonus: number;
  activeConverters: string[];
  craftPartGroups: CraftPartDto[];
}

