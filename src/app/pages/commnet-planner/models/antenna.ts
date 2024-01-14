import { AntennaDto } from '../../../common/domain/dtos/antenna-dto';
import { Group } from '../../../common/domain/group';
import { Icons } from '../../../common/domain/icons';

export enum ProbeControlPoint {
  SingleHop = 'single-hop',
  MultiHop = 'multi-hop',
}

export class Antenna {

  get icon(): string {
    if (this.probeControlPoint) {
      return Icons.Pilot;
    }

    if (this.label.includes('Tracking Station')) {
      return Icons.Construction;
    }

    if (this.relay) {
      return Icons.Relay;
    }

    if (this.label.includesSome(['Ground', 'Experiment'])) {
      return Icons.Experiment;
    }

    return Icons.Antenna;
  }

  constructor(public label: string,
              public cost: number,
              public mass: number,
              public electricityPMit: number = 0,
              public electricityPS: number = 0,
              public transmissionSpeed: number = 0,
              public relay?: boolean,
              public tier?: number,
              public powerRating: number = 0,
              public combinabilityExponent: number = 0,
              public probeControlPoint?: ProbeControlPoint) {
  }

  static combinedPower(antennae: Group<Antenna>[]): number {
    if (!antennae.length) {
      return 0;
    }

    let strongestAntennaPower = antennae
      .max(g => g.item.powerRating)
      .item
      .powerRating;
    let {sumOfAntennaPowers, averageCombinabilityExponent}
      = this.getAverageCombinabilityExponent(antennae);

    let vesselPower = strongestAntennaPower
      * (sumOfAntennaPowers / strongestAntennaPower)
        .pow(averageCombinabilityExponent);
    return vesselPower;
  }

  static getAverageCombinabilityExponent(antennae: Group<Antenna>[]) {
    let sumOfAntennaPowers = antennae.map(({item, count}) => item.powerRating * count).sum();
    let averageCombinabilityExponent = antennae
        .sum(({item, count}) => item.powerRating * item.combinabilityExponent * count)
      / sumOfAntennaPowers;
    return {sumOfAntennaPowers, averageCombinabilityExponent};
  }

  static containsRelay(antennae: Group<Antenna>[]): boolean {
    return antennae.some(a => a.item.relay);
  }

  static bestProbeControlPoint(antennae: Antenna[]): ProbeControlPoint {
    let distinctControlTypes = antennae
      .map(g => g.probeControlPoint)
      .distinct();

    return distinctControlTypes.includes(ProbeControlPoint.MultiHop)
      ? ProbeControlPoint.MultiHop
      : distinctControlTypes.includes(ProbeControlPoint.SingleHop)
        ? ProbeControlPoint.SingleHop
        : null;
  }

  static fromJson(json: AntennaDto): Antenna {
    return new Antenna(
      json.label,
      json.cost,
      json.mass,
      json.electricityPMit,
      json.electricityPS,
      json.transmissionSpeed,
      json.relay,
      json.tier,
      json.powerRating,
      json.combinabilityExponent,
      json.probeControlPoint as ProbeControlPoint,
    );
  }

}
