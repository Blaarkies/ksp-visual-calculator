import { Draggable } from './draggable';
import { Antenna } from '../antenna';
import { Group } from '../group';
import { Vector2 } from '../vector2';
import { LabeledOption } from '../input-fields/labeled-option';

export class SpaceObjectType {

  static Star = 'star';
  static Planet = 'planet';
  static Moon = 'moon';
  static Craft = 'craft';

  private static All = [
    SpaceObjectType.Star,
    SpaceObjectType.Planet,
    SpaceObjectType.Moon,
    SpaceObjectType.Craft,
  ];

  // todo: use dedicated labels instead of re-using source code labels
  static List = SpaceObjectType.All.map(a => new LabeledOption(a[0].toLocaleUpperCase() + a.slice(1), a));

  static fromString(type: string) {
    let match = SpaceObjectType.All.includes(type);
    if (!match) {
      throw console.error(`${type} is not a valid SpaceObjectType`);
    }

    return type;
  }
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
              public antennae: Group<Antenna>[] = [],
              public hasDsn?: boolean) {
    this.draggableHandle = new Draggable(label, `url(${imageUrl}) 0 0`, moveType);
  }

  get powerRatingTotal(): number {
    return Antenna.combinedPower(this.antennae);
  }

  get powerRatingRelay(): number {
    return Antenna.combinedPower(this.antennae.filter(a => a.item.relay));
  }

  get hasRelay(): boolean {
    return Antenna.containsRelay(this.antennae);
  }

}
