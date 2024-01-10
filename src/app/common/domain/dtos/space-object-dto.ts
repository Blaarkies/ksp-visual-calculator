import { DraggableDto } from './draggable.dto';
import { OrbitDto } from './orbit-dto';

export interface SpaceObjectDto {
  id: string;
  size: number;
  draggable: DraggableDto;
  type: string;
  orbit?: OrbitDto;
}
