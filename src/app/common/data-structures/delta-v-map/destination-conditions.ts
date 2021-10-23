import { TravelCondition } from './travel-condition';

export class DestinationConditions {

    readonly surface: string;
    readonly lowOrbit: string;
    readonly ellipticalOrbit: string;
    readonly geostationaryOrbit: string;

    constructor(public readonly name: string) {
        this.surface = `${name}:${TravelCondition.Surface}`;
        this.lowOrbit = `${name}:${TravelCondition.LowOrbit}`;
        this.ellipticalOrbit = `${name}:${TravelCondition.EllipticalOrbit}`;
        this.geostationaryOrbit = `${name}:${TravelCondition.GeostationaryOrbit}`;
    }

    planeWith(other: DestinationConditions) {
        return `${this.name}:${TravelCondition.PlaneWith}:${other.name}`;
    }

    interceptWith(other: DestinationConditions) {
        return `${this.name}:${TravelCondition.InterceptWith}:${other.name}`;
    }

}
