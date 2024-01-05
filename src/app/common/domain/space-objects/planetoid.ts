import { PlanetoidDto } from '../dtos/planetoid-dto';
import { Group } from '../group';
import { Communication } from './communication';
import { MoveType } from './move-type';
import { PlanetoidType } from './planetoid-type';
import { SpaceObject } from './space-object';
import { SpaceObjectType } from './space-object-type';

export class Planetoid extends SpaceObject {

  showSoi?: boolean;
  communication?: Communication;

  constructor(label: string,
              imageUrl: string,
              moveType: MoveType,
              antennae: Group<string>[],
              public planetoidType: PlanetoidType,
              public size: number,
              public sphereOfInfluence: number,
              public equatorialRadius: number) {
    super(size, label, imageUrl, moveType, SpaceObjectType.Planetoid);
    if (antennae?.length) {
      this.communication = new Communication(antennae.slice());
    }
  }

  toJson(): PlanetoidDto {
    let base = super.toJson();
    return {
      ...base,
      communication: this.communication?.toJson(),
      planetoidType: this.planetoidType.name,
      size: this.size,
      sphereOfInfluence: this.sphereOfInfluence,
      equatorialRadius: this.equatorialRadius,
    };
  }

  static fromJson(json: PlanetoidDto): Planetoid {
    let communication = json.communication ? Communication.fromJson(json.communication) : undefined;
    let planetoidType = PlanetoidType.fromString(json.planetoidType);

    let object = new Planetoid(
      json.draggable.label,
      json.draggable.imageUrl,
      json.draggable.moveType,
      communication?.antennae ?? [],
      planetoidType,
      json.size,
      json.sphereOfInfluence,
      json.equatorialRadius,
    );

    return object;
  }

}
