import { Antenna } from '../../common/domain/antenna';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';

export class CelestialBodyDetails {

  constructor(public name: string,
              public celestialBodyType: SpaceObjectType,
              public size: number,
              public orbitColor: string,
              public currentDsn: Antenna) {
  }

}
