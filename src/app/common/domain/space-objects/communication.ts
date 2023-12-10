import { SubjectHandle } from '../../subject-handle';
import {
  Antenna,
  ProbeControlPoint,
} from '../antenna';
import { Group } from '../group';

export class Communication {

  hasControl$ = new SubjectHandle<boolean>({defaultValue: false});

  private bestProbeControlPoint: ProbeControlPoint;

  constructor(
    public antennae: Group<Antenna>[] = [],
    public isDsn?: boolean,
  ) {
    this.bestProbeControlPoint = this.getBestProbeControlPoint(antennae);
    this.hasControl$.set(!!this.bestProbeControlPoint);
  }

  private getBestProbeControlPoint(antennae: Group<Antenna>[]) {
    return Antenna.bestProbeControlPoint(antennae.map(a => a.item));
  }

  destroy() {
    this.hasControl$.destroy();
  }

  toJson(): {} {
    return {
      antennae: this.antennae.map(a => [a.item.label, a.count]),
      isDsn: this.isDsn,
    };
  }

  static fromJson(json: any, getAntenna: (name: string) => Antenna): Communication {
    let antennae = json.antennae.map(([label, count]) =>
      new Group<Antenna>(getAntenna(label), count));
    return new Communication(antennae);
  }

  noSignal(): void {
    this.hasControl$.set(!!this.bestProbeControlPoint);
  }

  setAntennae(antennae: Group<Antenna>[]) {
    this.antennae = antennae;
    this.bestProbeControlPoint = this.getBestProbeControlPoint(this.antennae);
  }

  containsRelay(): boolean {
    return Antenna.containsRelay(this.antennae);
  }

  powerRatingTotal(): number {
    return Antenna.combinedPower(this.antennae);
  }

  powerRatingRelay(): number {
    return Antenna.combinedPower(
      this.antennae.filter(a => a.item.relay));
  }

  bestRemoteGuidanceCapability(): ProbeControlPoint {
    return this.bestProbeControlPoint;
  }

}
