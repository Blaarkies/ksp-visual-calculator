import {
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import {
  Antenna,
  ProbeControlPoint,
} from '../../../pages/commnet-planner/models/antenna';
import { SubjectHandle } from '../../subject-handle';
import { CommunicationDto } from '../dtos/communication-dto';
import { Group } from '../group';
import { AntennaeManager } from './antennae-manager';

export class Communication {

  hasControl$ = new SubjectHandle<boolean>({defaultValue: false});
  instanceAntennae: Group<Antenna>[];
  stringAntennae: Group<string>[];
  change$ = new Subject<void>;

  private bestProbeControlPoint: ProbeControlPoint;
  private destroy$ = new Subject<void>();

  constructor(
    private antennaeManager: AntennaeManager,
    antennae: Group<string>[] = [],
  ) {
    this.setAntennae(antennae).pipe(
      takeUntil(this.destroy$))
      .subscribe();
  }

  private getBestProbeControlPoint(): ProbeControlPoint {
    return Antenna.bestProbeControlPoint(this.instanceAntennae.map(a => a.item));
  }

  destroy() {
    this.hasControl$.destroy();
    this.change$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  toJson(): CommunicationDto {
    return {
      antennae: this.stringAntennae.map(g => [g.item, g.count]),
    };
  }

  static fromJson(json: CommunicationDto,
                  antennaeManager: AntennaeManager): Communication {
    let antennae = json.antennae.map(g =>
      new Group(g[0].toString(), g[1] as number));
    return new Communication(antennaeManager, antennae);
  }

  noSignal(): void {
    this.hasControl$.set(!!this.bestProbeControlPoint);
    this.change$.next();
  }

  setAntennae(antennae: Group<string>[]): Observable<void> {
    this.stringAntennae = antennae;

    return this.antennaeManager.antennaeMap$.pipe(
      tap(antennaeMap => {
        this.instanceAntennae = antennae
          .map(a => new Group(antennaeMap.get(a.item), a.count))
          .filter(g => g.item);

        this.bestProbeControlPoint = this.getBestProbeControlPoint();
        this.hasControl$.set(!!this.bestProbeControlPoint);

        this.change$.next();
      }),
      map(() => undefined));
  }

  containsRelay(): boolean {
    return Antenna.containsRelay(this.instanceAntennae);
  }

  powerRatingTotal(): number {
    return Antenna.combinedPower(this.instanceAntennae);
  }

  powerRatingRelay(): number {
    return Antenna.combinedPower(
      this.instanceAntennae.filter(a => a.item.relay));
  }

  bestRemoteGuidanceCapability(): ProbeControlPoint {
    return this.bestProbeControlPoint;
  }

}
