import { SpaceObjectType } from '../../common/domain/space-objects/space-object';

export class CelestialBodyDetails {

  constructor(public name: string,
              public celestialBodyType: SpaceObjectType,
              public size: number,
              public orbitColor: string,
              public hasDsn: boolean) {
  }

}
