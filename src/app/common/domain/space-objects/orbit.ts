import { OrbitParameterData } from './orbit-parameter-data';
import { SpaceObjectType } from './space-object-type';

export class Orbit {

  type: SpaceObjectType;

  constructor(public parameters: OrbitParameterData,
              public color: string) {
  }

  toJson(): {} {
    return {
      type: this.type.name,
      parameters: this.parameters.toJson(),
      color: this.color,
    };
  }

}
