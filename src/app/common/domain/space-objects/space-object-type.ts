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
  static List = SpaceObjectType.All.map(sot =>
    new LabeledOption(sot.name[0].toLocaleUpperCase() + sot.name.slice(1), sot));

  static fromString(type: 'planetoid' | 'craft' | string): SpaceObjectType {
    let match = SpaceObjectType.All.find(t => t.name === type);
    if (!match) {
      throw new Error(`${type} is not a valid SpaceObjectType`);
    }

    return match;
  }

}
