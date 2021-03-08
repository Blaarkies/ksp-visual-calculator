export class Antenna {

  constructor(public name: string,
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

  static combinedPower(antennae: Antenna[]): number {
    let strongestAntennaPower = antennae.sort((a, b) => a.powerRating - b.powerRating).first().powerRating;
    let sumOfAntennaPowers = antennae.map(a => a.powerRating).sum();
    let averageCombinabilityExponent = antennae.map(a => a.powerRating * a.combinabilityExponent)
      .sum() / sumOfAntennaPowers;

    let vesselPower = strongestAntennaPower
      * (sumOfAntennaPowers / strongestAntennaPower)
        .pow(averageCombinabilityExponent);
    return vesselPower;
  }

  static containsRelay(antennae: Antenna[]): boolean {
    return antennae.some(a => a.relay);
  }
}
