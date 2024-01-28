import { PlanetoidDto } from '../../common/domain/dtos/planetoid-dto';
import { Group } from '../../common/domain/group';
import { AntennaeManager } from '../../common/domain/space-objects/antennae-manager';
import { MoveType } from '../../common/domain/space-objects/move-type';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';
import { Vector2 } from '../../common/domain/vector2';
import { SoiManager } from './soi-manager';
import { AbstractSpaceObjectFactory } from './space-object-factory.abstract';

export class PlanetoidFactory extends AbstractSpaceObjectFactory {

  constructor(protected soiManager: SoiManager,
              private antennaeManager?: AntennaeManager) {
    super();
  }

  makePlanetoid(
    id: string,
    label: string,
    imageUrl: string,
    moveType: MoveType,
    antennaeGroups: Group<string>[],
    planetoidType: PlanetoidType,
    size: number,
    sphereOfInfluence: number,
    equatorialRadius: number,
    location?: Vector2,
    lastAttemptLocation?: number[],
  ): Planetoid {
    return new Planetoid(
      this.soiManager,
      this.antennaeManager,
      id,
      label,
      imageUrl,
      moveType,
      antennaeGroups,
      planetoidType,
      size,
      sphereOfInfluence,
      equatorialRadius,
      location,
      lastAttemptLocation,
    );
  }

  makePlanetoidFromJson(json: PlanetoidDto) {
    return Planetoid.fromJson(json, this.soiManager, this.antennaeManager);
  }

}
