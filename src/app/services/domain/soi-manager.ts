import { BehaviorSubject } from 'rxjs';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { Vector2 } from '../../common/domain/vector2';

export class SoiManager {

  get planetoids(): Planetoid[] {
    return this.planetoids$.value;
  }

  constructor(private planetoids$: BehaviorSubject<Planetoid[]>) {
  }

  getSoiParent(location: Vector2): Planetoid | undefined {
    return this.planetoids$.value
      .map(planetoid => ({
        planetoid,
        distance: planetoid.location.distance(location),
      }))
      .filter(({planetoid: p, distance}) =>
        !p.sphereOfInfluence // star has infinite SOI range
        || distance <= p.sphereOfInfluence)
      .min(({distance}) => distance)
      .planetoid;
  }

}
