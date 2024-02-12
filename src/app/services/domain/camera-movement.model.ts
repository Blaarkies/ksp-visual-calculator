import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Vector2 } from '../../common/domain/vector2';
import { TimingFunction } from './timing-function.type';

export class CameraMovement {

  isAnimation: boolean;

  constructor(
    public scaleEnd: number,
    public locationEnd: Vector2,
    public scaleStart: number,
    public locationStart: Vector2,
    public duration: number,
    public timingFunction: TimingFunction,
    public focus: SpaceObject,
  ) {
    this.isAnimation = duration > 0;
  }

}
