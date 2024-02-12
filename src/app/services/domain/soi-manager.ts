import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { Vector2 } from '../../common/domain/vector2';
import { AbstractUniverseBuilderService } from './universe-builder.abstract.service';

/**
 * Craft need access to the list of planetoids in the universe to determine
 * if they have been user-dragged into the Sphere of Influence bubble
 * of another planetoid. This changes how craft get locked into orbital
 * positions.
 */
export class SoiManager {

  get planetoids(): Planetoid[] {
    return this.builderService.planetoids$.value;
  }

  constructor(private builderService: AbstractUniverseBuilderService) {
  }

  getSoiParent(location: Vector2): Planetoid | undefined {
    return this.builderService.planetoids$.value
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
