import { Orbit } from './space-objects/orbit';
import { PlanetoidType } from './space-objects/planetoid-type';

export interface OrbitWithPlanetoidType {
    orbit: Orbit;
    type: PlanetoidType;
}
