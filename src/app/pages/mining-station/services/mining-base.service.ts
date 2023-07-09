import { Injectable } from '@angular/core';
import {
  firstValueFrom,
  Observable,
  Subject,
} from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { Group } from '../../../common/domain/group';
import { AnalyticsService } from '../../../services/analytics.service';
import { EventLogs } from '../../../services/domain/event-logs';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { StockEntitiesCacheService } from '../../../services/stock-entities-cache.service';
import { engineerBonusMap } from '../components/engineer-skill-selector/engineer-skill-selector.component';
import { CraftPart } from '../domain/craft-part';
import { StatisticsMapType } from '../domain/isru-statistics-generator';
import { StateIsru } from '../domain/state-isru';

@Injectable()
export class MiningBaseService {

  planet: CelestialBody;
  oreConcentration: number = .05;
  engineerBonus: number = 0;
  activeConverters: string[] = [];
  partSelection: Group<CraftPart>[] = [];
  statisticsMap: StatisticsMapType;

  loadState$ = new Subject<void>();

  planetUpdated$ = new Subject<void>();
  oreConcentrationUpdated$ = new Subject<void>();
  engineerBonusUpdated$ = new Subject<void>();
  activeConvertersUpdated$ = new Subject<void>();
  partSelectionUpdated$ = new Subject<void>();
  partCountUpdated$ = new Subject<Group<CraftPart>>();
  statisticsMapUpdated$ = new Subject<void>();

  constructor(private cacheService: StockEntitiesCacheService,
              private analyticsService: AnalyticsService) {
  }

  destroy() {
    this.loadState$.complete();
    this.planetUpdated$.complete();
    this.oreConcentrationUpdated$.complete();
    this.engineerBonusUpdated$.complete();
    this.activeConvertersUpdated$.complete();
    this.partSelectionUpdated$.complete();
    this.partCountUpdated$.complete();
    this.statisticsMapUpdated$.complete();
  }

  updatePlanet(value: CelestialBody) {
    this.planet = value;
    this.planetUpdated$.next();
  }

  updateOreConcentration(value: number) {
    this.oreConcentration = value;
    this.oreConcentrationUpdated$.next();
  }

  updateEngineerBonus(value: number) {
    this.engineerBonus = value;
    this.engineerBonusUpdated$.next();
  }

  updateActiveConverters(list: string[]) {
    this.activeConverters = list;
    this.activeConvertersUpdated$.next();
  }

  updatePartList(list: Group<CraftPart>[]) {
    this.partSelection = list;
    this.partSelectionUpdated$.next();
  }

  updatePartCount(count: number, part: CraftPart) {
    let match = this.partSelection.find(stale => stale.item === part);
    if (match) {
      match.count = count;
      this.partCountUpdated$.next(match);

      return;
    }

    console.error('Part not found', part, this.partSelection);
    this.analyticsService.logEvent('Part not found', {
      category: EventLogs.Category.MiningStation,
      id: part.id,
      count,
      partsTotal: this.partSelection.length,
    });
  }

  updateStatisticsMap(value: StatisticsMapType) {
    this.statisticsMap = value;
    this.statisticsMapUpdated$.next();
  }

  async setupEmptyState() {
    let planets = await firstValueFrom(this.cacheService.planets$);
    let kerbin = planets.bodies.find(b => b.id === 'kerbin') || planets.bodies[4];
    this.updatePlanet(kerbin);
    this.updateOreConcentration(.05);
    this.updateEngineerBonus(engineerBonusMap.get(-1));
    this.updateActiveConverters([]);
    this.updatePartList([]);
    this.updateStatisticsMap(null);

    this.loadState$.next();
  }

  async setupFullState(state: StateIsru): Promise<boolean> {
    let planets = await firstValueFrom(this.cacheService.planets$);
    let planet = planets.bodies.find(b => b.id === state.planet);
    this.updatePlanet(planet);
    this.updateOreConcentration(state.oreConcentration);
    this.updateEngineerBonus(state.engineerBonus);
    this.updateActiveConverters(state.activeConverters ?? []);

    let parts = await firstValueFrom(this.cacheService.miningParts$);
    let partsMap = new Map<string, CraftPart>(parts.map(p => [p.id, p]));
    let partList = state.craftPartGroups.map(g => new Group(partsMap.get(g.id), g.count));
    this.updatePartList(partList);
    this.updateStatisticsMap(null);

    this.loadState$.next();

    return true;
  }

  buildState(state?: StateIsru): Observable<any> {
    if (state) {
      return fromPromise(this.setupFullState(state));
    } else {
      return fromPromise(this.setupEmptyState());
    }
  }

}
