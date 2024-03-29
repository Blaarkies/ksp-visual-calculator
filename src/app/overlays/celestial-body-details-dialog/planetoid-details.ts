import { Antenna } from '../../pages/commnet-planner/models/antenna';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';

export class PlanetoidDetails {

  constructor(public name: string,
              public planetoidType: PlanetoidType,
              public size: number,
              public orbitColor: string,
              public currentDsn: Antenna) {
  }

}
