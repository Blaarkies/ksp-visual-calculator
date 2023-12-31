import { CommunicationDto } from './communication-dto';
import { SpaceObjectDto } from './space-object-dto';

export interface PlanetoidDto extends SpaceObjectDto {
  communication?: CommunicationDto;
  planetoidType: string;
  sphereOfInfluence: number;
  equatorialRadius: number;
  hasDsn?: boolean;
}
