import { Orbit } from '../../common/domain/space-objects/orbit';
import { Planetoid } from '../../common/domain/space-objects/planetoid';

export interface OrbitsBodies {
  listOrbits: Orbit[];
  celestialBodies: Planetoid[];
}
