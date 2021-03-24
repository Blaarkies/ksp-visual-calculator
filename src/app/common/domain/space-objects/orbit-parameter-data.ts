import { Vector2 } from '../vector2';

export class OrbitParameterData {

  constructor(public xy?: number[],
              public r?: number) {
  }

  static fromRadius(r: number) {
    return new OrbitParameterData([], r);
  }

  static fromVector2(location: Vector2) {
    return new OrbitParameterData([location.x, location.y], null);
  }
}
