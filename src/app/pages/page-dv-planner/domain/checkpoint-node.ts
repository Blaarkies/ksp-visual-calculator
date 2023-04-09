import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { TravelCondition } from './travel-condition';

export class CheckpointNode {

  body: SpaceObject;
  name: string;
  condition: TravelCondition;
  aerobraking: boolean;
  availableConditions: TravelCondition[];

  allowAerobraking: boolean;
  allowGravityAssist: boolean;

  constructor(params: {
    body: SpaceObject,
    name: string,
    condition: TravelCondition,
    aerobraking: boolean,
    availableConditions: TravelCondition[],
  }) {
    this.body = params.body;
    this.name = params.name;
    this.condition = params.condition;
    this.aerobraking = params.aerobraking;
    this.availableConditions = params.availableConditions;
  }

  toJson(): {} {
    return {
      name: this.name,
      condition: this.condition,
      aerobraking: this.aerobraking,
    };
  }

  static fromJson(json: any,
                  getBodyByLabel: (label: string) => SpaceObject,
                  getAvailableConditions: (label: string) => TravelCondition[]): CheckpointNode {
    let label = json.name;
    return new CheckpointNode({
      ...json,
      body: getBodyByLabel(label),
      availableConditions: getAvailableConditions(label),
    });
  }

}
