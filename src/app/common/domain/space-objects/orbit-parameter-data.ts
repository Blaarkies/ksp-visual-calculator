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

  toJson(): {} {
    return {
      xy: this.xy,
      r: this.r,
      parent: this.parent?.label,
    };
  }

  static fromJson(json: any) {
    return new OrbitParameterData(json.xy, json.r, json.parent);
  }
}
