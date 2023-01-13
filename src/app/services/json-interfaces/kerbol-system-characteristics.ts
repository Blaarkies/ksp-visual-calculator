export interface KerbolSystemCharacteristics {
  bodies: CelestialBody[];
}

export interface CelestialBody {
  id: string;
  type: string;
  name: string;
  parent?: string;
  semiMajorAxis?: number;
  equatorialRadius: number;
  sphereOfInfluence?: number;
  imageUrl: string;
  orbitLineColor?: string;
  hasDsn?: boolean;
}
