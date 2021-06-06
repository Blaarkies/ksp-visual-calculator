import { Draggable } from './draggable';
import { Antenna } from '../antenna';
import { Group } from '../group';
import { Vector2 } from '../vector2';
import { LabeledOption } from '../input-fields/labeled-option';
import { MoveType } from './move-type';
import { Icons } from '../icons';

export class SpaceObjectType {

  get icon(): string {
    return this === SpaceObjectType.Star
      ? Icons.Star
      : this === SpaceObjectType.Planet
        ? Icons.Planet
        : this === SpaceObjectType.Moon
          ? Icons.Moon
          : Icons.Craft;
  }

  static types = {
    star: 'star',
    planet: 'planet',
    moon: 'moon',
    craft: 'craft',
  };

  static Star = new SpaceObjectType(SpaceObjectType.types.star);
  static Planet = new SpaceObjectType(SpaceObjectType.types.planet);
  static Moon = new SpaceObjectType(SpaceObjectType.types.moon);
  static Craft = new SpaceObjectType(SpaceObjectType.types.craft);

  constructor(public name: string) {
  }

  private static All: SpaceObjectType[] = [
    SpaceObjectType.Star,
    SpaceObjectType.Planet,
    SpaceObjectType.Moon,
    SpaceObjectType.Craft,
  ];

  // todo: use dedicated labels instead of re-using source code labels
  static List = SpaceObjectType.All.map(sot =>
    new LabeledOption(sot.name[0].toLocaleUpperCase() + sot.name.slice(1), sot));

  static fromString(type: 'star' | 'planet' | 'moon' | 'craft'): SpaceObjectType {
    let match = SpaceObjectType.All.find(t => t.name === type);
    if (!match) {
      throw console.error(`${type} is not a valid SpaceObjectType`);
    }

    return match;
  }

}

export class SpaceObject {

  draggableHandle: Draggable;
  showSoi?: boolean;

  get label(): string {
    return this.draggableHandle.label;
  }

  get location(): Vector2 {
    return this.draggableHandle.location;
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

  constructor(public size: number,
              label: string,
              imageUrl: string,
              moveType: MoveType,
              public type: SpaceObjectType,
              public antennae: Group<Antenna>[] = [],
              public hasDsn?: boolean,
              public sphereOfInfluence?: number,
              public equatorialRadius?: number) {
    this.draggableHandle = new Draggable(label, `url(${imageUrl}) 0 0`, moveType);
  }

}
