import { LabeledOption } from './input-fields/labeled-option';
import { Group } from './group';

export class Antenna {

  constructor(public label: string,
              // public cost: number,
              // public mass: number,
              // public electricityPMit: number,
              // public electricityPS: number,
              // public transmissionSpeed: number,
              public relay: boolean,
              // public tier: number,
              public powerRating: number,
              public combinabilityExponent: number,
  ) {
  }

  static Dsn1 = new Antenna('DSN Network 1', true, 2e9, .75);
  static Communotron16 = new Antenna('Communotron 16', false, 5e3, 1);
  static HG5HighGainAntenna = new Antenna('HG-5 High Gain Antenna', true, 5e6, .75);


  private static All = [
    Antenna.Dsn1,
    Antenna.Communotron16,
    Antenna.HG5HighGainAntenna,
  ];

  static List = Antenna.All.map(a => new LabeledOption(a.label, a));

  static combinedPower(antennae: Group<Antenna>[]): number {
    let strongestAntennaPower = antennae
      .map(g => g.item)
      .sort((a, b) => a.powerRating - b.powerRating)
      .first()
      .powerRating;
    let sumOfAntennaPowers = antennae.map(({item, count}) => item.powerRating * count).sum();
    let averageCombinabilityExponent = antennae
      .map(({item, count}) => item.powerRating * item.combinabilityExponent * count)
      .sum() / sumOfAntennaPowers;

    let vesselPower = strongestAntennaPower
      * (sumOfAntennaPowers / strongestAntennaPower)
        .pow(averageCombinabilityExponent);
    return vesselPower;
  }

  static containsRelay(antennae: Group<Antenna>[]): boolean {
    return antennae.map(g => g.item).some(a => a.relay);
  }
}
