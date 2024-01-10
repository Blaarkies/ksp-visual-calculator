import { Icons } from '../icons';
import { LabeledOption } from '../input-fields/labeled-option';
import { Planetoid } from './planetoid';

export class SpaceObjectType {

  get icon(): string {
    return this === SpaceObjectType.Planetoid
      ? Icons.Planet
      : Icons.Craft;
  }

  static types = {
    planetoid: 'planetoid',
    craft: 'craft',
  };

  static Planetoid = new SpaceObjectType(SpaceObjectType.types.planetoid);
  static Craft = new SpaceObjectType(SpaceObjectType.types.craft);

  constructor(public name: string) {
  }

  private static All: SpaceObjectType[] = [
    SpaceObjectType.Planetoid,
    SpaceObjectType.Craft,
  ];

  // todo: use dedicated labels instead of re-using source code labels
  static List = SpaceObjectType.All.map(t =>
    new LabeledOption(t.name[0].toLocaleUpperCase() + t.name.slice(1), t));

  static fromString(type: 'planetoid' | 'craft' | string): SpaceObjectType {
    let match = SpaceObjectType.All.find(t => t.name === type);
    if (!match) {
      throw new Error(`${type} is not a valid SpaceObjectType`);
    }

    return match;
  }

}
