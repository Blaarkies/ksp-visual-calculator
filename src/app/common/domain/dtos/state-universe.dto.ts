import { CameraDto } from './camera.dto';
import { PlanetoidDto } from './planetoid-dto';
import { StateContextualDto } from './state-contextual.dto';

export interface StateUniverseDto extends StateContextualDto {
  planetoids: PlanetoidDto[];
  camera: CameraDto;
}
