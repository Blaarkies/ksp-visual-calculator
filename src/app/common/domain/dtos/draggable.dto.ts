import { MoveType } from '../space-objects/move-type';
import { OrbitDto } from './orbit-dto';

export interface DraggableDto {
  label: string;
  children: string[];
  location: number[];
  imageUrl: string;
  moveType: MoveType;
  lastAttemptLocation: number[];
}
