import { TravelCondition } from '../data-structures/delta-v-map/travel-condition';

export class CheckpointPreferences {

  constructor(public aerobraking: boolean,
              public planeChangeCost: number,
              public condition: TravelCondition) {
  }

  static default = new CheckpointPreferences(false, 100, TravelCondition.Surface);

  static fromObject(preferences: any): CheckpointPreferences {
    return new CheckpointPreferences(preferences.aerobraking, preferences.planeChangeCost, preferences.condition);
  }

}
