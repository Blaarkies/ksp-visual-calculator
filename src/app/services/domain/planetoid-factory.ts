import { BehaviorSubject } from 'rxjs';
import { PlanetoidDto } from '../../common/domain/dtos/planetoid-dto';
import { Group } from '../../common/domain/group';
import { MoveType } from '../../common/domain/space-objects/move-type';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';
import { Vector2 } from '../../common/domain/vector2';
import { SoiManager } from './soi-manager';

export class PlanetoidFactory {

  private readonly soiManager: SoiManager;

  constructor(planetoids$: BehaviorSubject<Planetoid[]>) {
    this.soiManager = new SoiManager(planetoids$);
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
    return Planetoid.fromJson(json, this.soiManager);
  }

}
