import { StateContextual } from '../../../services/json-interfaces/state-contextual';
import { StateCraftPart } from '../../../services/json-interfaces/state-craft-part';

export interface StateIsru extends StateContextual {
  landed: boolean;
  planet?: string;
  distanceFromStar?: number;
  oreConcentration: number;
  engineerBonus: number;
  activeConverters: string[];
  craftPartGroups: StateCraftPart[];
}

