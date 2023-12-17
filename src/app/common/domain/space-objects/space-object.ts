import { SpaceObjectDto } from '../dtos/space-object-dto';
import { Vector2 } from '../vector2';
import { Draggable } from './draggable';
import { MoveType } from './move-type';
import { SpaceObjectType } from './space-object-type';

export abstract class SpaceObject {

  draggable: Draggable;

  get label(): string {
    return this.draggable.label;
  }

  get location(): Vector2 {
    return this.draggable.location;
  }

  protected constructor(
    public size: number,
    label: string,
    imageUrl: string,
    moveType: MoveType,
    public type: SpaceObjectType,
  ) {
    this.draggable = new Draggable(label, imageUrl, moveType);
  }

  toJson(): SpaceObjectDto {
    return {
      size: this.size,
      draggable: this.draggable.toJson(),
      type: this.type.name,
      orbit: this.draggable.orbit?.toJson(),
    };
  }

}
