import { Icons } from '../icons';
import { LabeledOption } from '../input-fields/labeled-option';

export class PlanetoidType {

  get icon(): string {
    return PlanetoidType.iconMap.get(this);
  }

  static types = {
    star: 'star',
    planet: 'planet',
    moon: 'moon',
  };

  static Star = new PlanetoidType(PlanetoidType.types.star);
  static Planet = new PlanetoidType(PlanetoidType.types.planet);
  static Moon = new PlanetoidType(PlanetoidType.types.moon);

  private static iconMap = new Map<PlanetoidType, string>([
    [PlanetoidType.Star, Icons.Star],
    [PlanetoidType.Planet, Icons.Planet],
    [PlanetoidType.Moon, Icons.Moon],
  ]);

  constructor(public name: string) {
  }

  private static All: PlanetoidType[] = [
    PlanetoidType.Star,
    PlanetoidType.Planet,
    PlanetoidType.Moon,
  ];

  // todo: use dedicated labels instead of re-using source code labels
  static List = PlanetoidType.All.map(sot =>
    new LabeledOption(sot.name[0].toLocaleUpperCase() + sot.name.slice(1), sot));

  static fromString(type: string): PlanetoidType {
    let match = PlanetoidType.All.find(t => t.name === type);
    if (!match) {
      throw new Error(`[${type}] is not a valid PlanetoidType`);
    }

    return match;
  }

}
