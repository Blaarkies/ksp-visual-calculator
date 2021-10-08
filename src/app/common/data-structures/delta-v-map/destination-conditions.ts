import { TravelConditions } from './travel-conditions';

export class DestinationConditions {

    readonly surface: string;
    readonly lowOrbit: string;
    readonly ellipticalOrbit: string;
    readonly geostationaryOrbit: string;

    constructor(public readonly name: string) {
        this.surface = `${name}:${TravelConditions.Surface}`;
        this.lowOrbit = `${name}:${TravelConditions.LowOrbit}`;
        this.ellipticalOrbit = `${name}:${TravelConditions.EllipticalOrbit}`;
        this.geostationaryOrbit = `${name}:${TravelConditions.GeostationaryOrbit}`;
    }

    planeWith(other: DestinationConditions) {
        return `${this.name}:${TravelConditions.PlaneWith}:${other.name}`
    }

    interceptWith(other: DestinationConditions) {
        return `${this.name}:${TravelConditions.InterceptWith}:${other.name}`
    }

}
