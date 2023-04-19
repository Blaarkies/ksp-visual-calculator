import { StateBase } from '../../../services/json-interfaces/state-base';
import { StateCraftPart } from '../../../services/json-interfaces/state-craft-part';

export interface StateIsru extends StateBase {
  landed: boolean;
  planet?: string;
  distanceFromStar?: number;
  oreConcentration: number;
  engineerBonus: number;
  activeConverters: string[];
  craftPartGroups: StateCraftPart[];
}

