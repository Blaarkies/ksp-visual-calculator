import { Circle } from './circle';

export class Orbit {

    parameters: Circle;

    constructor(circle: Circle, public color: string) {
        this.parameters = circle;
    }

}
