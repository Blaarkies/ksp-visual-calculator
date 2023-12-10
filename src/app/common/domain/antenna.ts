import { AntennaPart } from '../../services/json-interfaces/antenna-part';
import { Group } from './group';
import { Icons } from './icons';

export enum ProbeControlPoint {
  SingleHop = 'single-hop',
  MultiHop = 'multi-hop',
}

export class Antenna {

  get icon(): string {
    let isConstructionPart = this.combinabilityExponent === 0 && this.transmissionSpeed === 0
      || this.label.includes('Tracking Station');
    return isConstructionPart
      ? Icons.Construction
      : this.relay
        ? Icons.Relay
        : Icons.Antenna;
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

  static fromAntennaPart(part: AntennaPart): Antenna {
    return new Antenna(
      part.label,
      part.cost,
      part.mass,
      part.electricityPMit,
      part.electricityPS,
      part.transmissionSpeed,
      part.relay,
      part.tier,
      part.powerRating,
      part.combinabilityExponent,
      part.probeControlPoint as ProbeControlPoint,
    );
  }

}
