import { Orbit } from '../../common/domain/space-objects/orbit';
import { SpaceObject } from '../../common/domain/space-objects/space-object';

export interface OrbitsBodies {
  listOrbits: Orbit[];
  celestialBodies: SpaceObject[];
}
