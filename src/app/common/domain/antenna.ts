import { Group } from './group';
import { AntennaPart } from '../../services/json-interfaces/antenna-part';
import { Icons } from './icons';

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
              public electricityPMit: number,
              public electricityPS: number,
              public transmissionSpeed: number,
              public relay: boolean,
              public tier: number,
              public powerRating: number,
              public combinabilityExponent: number) {
  }

  static combinedPower(antennae: Group<Antenna>[]): number {
    if (!antennae.length) {
      return 0;
    }
    let strongestAntennaPower = antennae
      .map(g => g.item)
      .sort((a, b) => b.powerRating - a.powerRating)
      .first()
      .powerRating;
    let {sumOfAntennaPowers, averageCombinabilityExponent} = this.getAverageCombinabilityExponent(antennae);

    let vesselPower = strongestAntennaPower
      * (sumOfAntennaPowers / strongestAntennaPower)
        .pow(averageCombinabilityExponent);
    return vesselPower;
  }

  static getAverageCombinabilityExponent(antennae: Group<Antenna>[]) {
    let sumOfAntennaPowers = antennae.map(({item, count}) => item.powerRating * count).sum();
    let averageCombinabilityExponent = antennae
      .map(({item, count}) => item.powerRating * item.combinabilityExponent * count)
      .sum() / sumOfAntennaPowers;
    return {sumOfAntennaPowers, averageCombinabilityExponent};
  }

  static containsRelay(antennae: Group<Antenna>[]): boolean {
    return antennae.map(g => g.item).some(a => a.relay);
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
    );
  }

}
