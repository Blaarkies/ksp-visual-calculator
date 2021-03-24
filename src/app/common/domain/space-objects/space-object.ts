import { Draggable } from './draggable';
import { Antenna } from '../antenna';
import { Group } from '../group';
import { Vector2 } from '../vector2';

export class SpaceObjectType {

  static Star = 'star';
  static Planet = 'planet';
  static Moon = 'moon';
  static Craft = 'craft';

}

export class SpaceObject {

  draggableHandle: Draggable;

  get label(): string {
    return this.draggableHandle.label;
  }

  get location(): Vector2 {
    return this.draggableHandle.location;
  }

  constructor(public size: number,
              label: string,
              imageUrl: string,
              moveType: 'noMove' | 'freeMove' | 'orbital',
              public type: SpaceObjectType,
              public antennae: Group<Antenna>[] = []) {
    this.draggableHandle = new Draggable(label, `url(${imageUrl}) 0 0`, moveType);
  }

  get totalPowerRating(): number {
    return Antenna.combinedPower(this.antennae);
  }

  get hasRelay(): boolean {
    return Antenna.containsRelay(this.antennae);
  }

}
