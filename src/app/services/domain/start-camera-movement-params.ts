import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Vector2 } from '../../common/domain/vector2';
import { TimingFunction } from './timing-function.type';

export interface StartCameraMovementParams {
  newScale: number;
  newLocation: Vector2;
  duration?: number;
  timingFunction?: TimingFunction;
  focus?: SpaceObject;
}
