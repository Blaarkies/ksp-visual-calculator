import { SpaceObject } from './space-objects/space-object';
import { SetupService } from '../../services/setup.service';

export class TransmissionLine {

  // todo: memoize these, because the template is just calling a function here, on every change detection cycle
  get color(): string {
    let power = Math.round(this.strength * 15);
    let red = (31 - power * 2).coerceAtMost(15);
    let green = (power * 2).coerceAtMost(15);
    return `#${red.toString(16)}${green.toString(16)}0`;
  }

  constructor(public nodes: SpaceObject[],
              private setupService: SetupService /*todo: use a better reference to an up to date difficulty setting*/) {
  }

  // todo: memoize these, because the template is just calling a function here, on every change detection cycle
  get strength(): number {
    if (!this.nodes.some(n => n.hasRelay)) {
      return 0;
    }

    let distance = this.nodes[0].location.distance(this.nodes[1].location);
    // todo: when A direct antenna connects to B relay antenna,
    // disregard B direct antennae from calculation
    let maxRange = (this.nodes[0].totalPowerRating * this.nodes[1].totalPowerRating).sqrt()
      * this.setupService.difficultySetting.rangeModifier;

    if (distance > maxRange) {
      return 0;
    }
    let x = 1 - distance / maxRange; // relativeDistance
    let signalStrength = (3 - 2 * x) * x.pow(2);
    return signalStrength;
  }

}
