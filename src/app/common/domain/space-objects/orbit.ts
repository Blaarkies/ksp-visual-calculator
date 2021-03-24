import { OrbitParameterData } from './orbit-parameter-data';
import { SpaceObjectType } from './space-object';

export class Orbit {

  type: SpaceObjectType;

  constructor(public parameters: OrbitParameterData,
              public color: string) {
  }

}
