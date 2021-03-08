import { Draggable } from './draggable';
import { ConstrainLocationFunction } from './constrain-location-function';
import { Antenna } from './antenna';

export class SpaceObject extends Draggable {

  constructor(public size: number,
              label: string, imageUrl: string,
              constrainLocation: ConstrainLocationFunction,
              public antennae: Antenna[] = []) {
    super(label, `url(${imageUrl}) 0 0`, constrainLocation);
  }

  get totalPowerRating(): number {
    return Antenna.combinedPower(this.antennae);
  }

  get hasRelay(): boolean {
    return Antenna.containsRelay(this.antennae);
  }

}
