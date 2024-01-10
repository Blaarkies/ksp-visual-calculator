import { CommunicationDto } from './communication-dto';
import { SpaceObjectDto } from './space-object-dto';

export interface CraftDto extends SpaceObjectDto {
  craftType: string;
  communication: CommunicationDto;
}
