import {
  Subject,
  takeUntil,
} from 'rxjs';
import { antennaServiceGetAntennaeMap$ } from '../../../pages/commnet-planner/services/pseudo/antenna.service';
import { SubjectHandle } from '../../subject-handle';
import {
  Antenna,
  ProbeControlPoint,
} from '../../../pages/commnet-planner/models/antenna';
import { CommunicationDto } from '../dtos/communication-dto';
import { Group } from '../group';

export class Communication {

  hasControl$ = new SubjectHandle<boolean>({defaultValue: false});
  antennaeFull: Group<Antenna>[];
  antennae: Group<string>[];

  private bestProbeControlPoint: ProbeControlPoint;
  private destroy$ = new Subject<void>();

  constructor(antennae: Group<string>[] = []) {
    this.setAntennae(antennae);
  }

  private getBestProbeControlPoint(): ProbeControlPoint {
    return Antenna.bestProbeControlPoint(this.antennaeFull.map(a => a.item));
  }

  destroy() {
    this.hasControl$.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  toJson(): CommunicationDto {
    return {
      antennae: this.antennae.map(g => [g.item, g.count]),
    };
  }

  static fromJson(json: CommunicationDto): Communication {
    let antennae = json.antennae.map(g => new Group(g[0].toString(), g[1] as number));
    return new Communication(antennae);
  }

  noSignal(): void {
    this.hasControl$.set(!!this.bestProbeControlPoint);
  }

  setAntennae(antennae: Group<string>[]) {
    this.antennae = antennae;

    antennaServiceGetAntennaeMap$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(antennaeMap => {
        this.antennaeFull = antennae
          .map(a => new Group(antennaeMap.get(a.item), a.count))
          .filter(g => g.item); // TODO: fix antennaeMap empty when moving from a fresh dv page to the commnet page

        this.bestProbeControlPoint = this.getBestProbeControlPoint();
        this.hasControl$.set(!!this.bestProbeControlPoint);
      });
  }

  containsRelay(): boolean {
    return Antenna.containsRelay(this.antennaeFull);
  }

  powerRatingTotal(): number {
    return Antenna.combinedPower(this.antennaeFull);
  }

  powerRatingRelay(): number {
    return Antenna.combinedPower(
      this.antennaeFull.filter(a => a.item.relay));
  }

  bestRemoteGuidanceCapability(): ProbeControlPoint {
    return this.bestProbeControlPoint;
  }

}
