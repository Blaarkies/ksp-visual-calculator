import { SpaceObject } from './space-objects/space-object';
import { SetupService } from '../../services/setup.service';
import memoize from 'fast-memoize';

export class TransmissionLine {

  get color(): string {
    return this.memoizeColor(this.strength);
  }

  get strength(): number {
    return this.memoizeStrength(
      this.nodes[0].hasRelay,
      this.nodes[1].hasRelay,
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y,
      this.nodes[0].antennae,
      this.nodes[1].antennae,
    );
  }

  memoizeColor = memoize(strength => {
    let power = Math.round(strength * 15);
    let red = (31 - power * 2).coerceAtMost(15);
    let green = (power * 2).coerceAtMost(15);
    return `#${red.toString(16)}${green.toString(16)}0`;
  });

  memoizeStrength = memoize((hasRelay1, hasRelay2, ...rest) => {
    if (!hasRelay1 && !hasRelay2) {
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
  });

  constructor(public nodes: SpaceObject[],
              private setupService: SetupService /*todo: use a better reference to an up to date difficulty setting*/) {
  }


}
