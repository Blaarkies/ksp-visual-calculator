import { StarSystemDto } from '../../common/domain/dtos/star-system-dto';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { Planetoid } from '../../common/domain/space-objects/planetoid';

export interface EnrichedStarSystem {
  starSystem: StarSystemDto;
  listOrbits: Orbit[];
  planetoids: Planetoid[];
}
