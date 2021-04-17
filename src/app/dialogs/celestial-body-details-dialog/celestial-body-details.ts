import { SpaceObjectType } from '../../common/domain/space-objects/space-object';
import { Antenna } from '../../common/domain/antenna';

export class CelestialBodyDetails {

  constructor(public name: string,
              public celestialBodyType: SpaceObjectType,
              public size: number,
              public orbitColor: string,
              public currentDsn: Antenna) {
  }

}
