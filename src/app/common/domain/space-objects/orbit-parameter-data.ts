import { OrbitParametersDto } from '../dtos/orbit-parameters-dto';
import { Draggable } from './draggable';

export class OrbitParameterData {

  constructor(public xy?: number[],
              public r?: number,
              public parent?: Draggable) {
  }

  static fromRadius(r: number) {
    return new OrbitParameterData([], r);
  }

  toJson(): OrbitParametersDto {
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
