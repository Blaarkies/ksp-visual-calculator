import { Vector2 } from './vector2';

export interface TouchCameraControl {
  dxy: Vector2;
  dz: number;
  lastLocation: Vector2;
}
