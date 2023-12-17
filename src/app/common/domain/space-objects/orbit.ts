import { OrbitDto } from '../dtos/orbit-dto';
import { PlanetoidAssetDto } from '../dtos/planetoid-asset.dto';
import { Draggable } from './draggable';
import { OrbitParameterData } from './orbit-parameter-data';

export class Orbit {

  constructor(public parameters: OrbitParameterData,
              public color: string,
              public reference: Draggable) {
  }

  static fromJson(p: PlanetoidAssetDto, reference: Draggable): Orbit {
    return new Orbit(
      OrbitParameterData.fromRadius(p.semiMajorAxis),
      p.orbitLineColor,
      reference,
    );
  }

  toJson(): OrbitDto {
    return {
      parameters: this.parameters.toJson(),
      color: this.color,
      reference: this.reference.label,
    };
  }

}
