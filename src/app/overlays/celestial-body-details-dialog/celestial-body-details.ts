import { Antenna } from '../../common/domain/antenna';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';

export class CelestialBodyDetails {

  constructor(public name: string,
              public celestialBodyType: PlanetoidType,
              public size: number,
              public orbitColor: string,
              public currentDsn: Antenna) {
  }

}
