import { Vector2 } from '../vector2';
import { Draggable } from './draggable';

export class OrbitParameterData {

  constructor(public xy?: number[],
              public r?: number,
              public parent?: Draggable) {
  }

  static fromRadius(r: number) {
    return new OrbitParameterData([], r);
  }

  static fromVector2(location: Vector2) {
    return new OrbitParameterData([location.x, location.y], null);
  }

}
