import { TravelCondition } from '../../pages/page-dv-planner/domain/travel-condition';
import { DvRouteType } from '../../pages/page-dv-planner/domain/dv-route-type';

export class CheckpointPreferences {

  constructor(public errorMargin: number,
              public aerobraking: boolean,
              public planeChangeCost: number,
              public condition: TravelCondition,
              public routeType: DvRouteType) {
  }

  static default = new CheckpointPreferences(0, false, 100, TravelCondition.Surface, DvRouteType.lessDetours);

  static fromObject(preferences: any): CheckpointPreferences {
    return new CheckpointPreferences(
      preferences.errorMargin ?? 0,
      preferences.aerobraking,
      preferences.planeChangeCost,
      preferences.condition,
      preferences.routeType);
  }

}
