import { Icons } from '../icons';
import { LabeledOption } from '../input-fields/labeled-option';

export class SpaceObjectType {

    get icon(): string {
        return this === SpaceObjectType.Star
            ? Icons.Flare
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

    static fromString(type: 'star' | 'planet' | 'moon' | 'craft' | string): SpaceObjectType {
        let match = SpaceObjectType.All.find(t => t.name === type);
        if (!match) {
            throw console.error(`${type} is not a valid SpaceObjectType`);
        }

        return match;
    }

}
