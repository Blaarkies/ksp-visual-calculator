import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  firstValueFrom,
  Observable,
  of,
  ReplaySubject,
} from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { Group } from '../../../common/domain/group';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { StockEntitiesCacheService } from '../../../services/stock-entities-cache.service';
import { CraftPart } from '../domain/craft-part';
import { StatisticsMapType } from '../domain/isru-statistics-generator';
import { StateIsru } from '../domain/state-isru';

@Injectable()
export class MiningBaseService {

  planet$ = new BehaviorSubject<CelestialBody>(null);
  oreConcentration$ = new BehaviorSubject<number>(null);
  engineerBonus$ = new BehaviorSubject<number>(null);
  activeConverters$ = new BehaviorSubject<string[]>(null);
  craftPartGroups$ = new BehaviorSubject<Group<CraftPart>[]>(null);
  craftPartCounts$ = new BehaviorSubject<Group<CraftPart>>(null);
  statisticsMap$ = new BehaviorSubject<StatisticsMapType>(null);

  constructor(private cacheService: StockEntitiesCacheService) {
  }

  destroy() {
    this.planet$.complete();
    this.oreConcentration$.complete();
    this.engineerBonus$.complete();
    this.activeConverters$.complete();
    this.craftPartGroups$.complete();
    this.craftPartCounts$.complete();
    this.statisticsMap$.complete();
  }

  updatePlanet(value: CelestialBody) {
    this.planet$.next(value);
  }

  updateOreConcentration(value: number) {
    this.oreConcentration$.next(value);
  }

  updateEngineerBonus(value: number) {
    this.engineerBonus$.next(value);
  }

  updateConverters(list: string[]) {
    this.activeConverters$.next(list);
  }

  updatePartList(list: Group<CraftPart>[]) {
    this.craftPartGroups$.next(list);
  }

  updatePartCount(value: number, part: CraftPart) {
    this.craftPartCounts$.next(new Group(part, value));
  }

  updateStatisticsMap(value: StatisticsMapType) {
    this.statisticsMap$.next(value);
  }

  setupEmptyState() {
    this.updatePlanet(null);
    this.updateOreConcentration(null);
    this.updateEngineerBonus(null);
    this.updateConverters([]);
    this.updatePartList([]);
    this.updateStatisticsMap(null);
  }

  async setupFullState(state: StateIsru) {
    let planets = await firstValueFrom(this.cacheService.planets$);
    let planet = planets.bodies.find(b => b.id === state.planet);
    this.updatePlanet(planet);

    let ore = state.oreConcentration * 100;
    this.updateOreConcentration(ore.round(2));
    this.updateEngineerBonus(state.engineerBonus);
    this.updateConverters(state.activeConverters ?? []);

    let parts = await firstValueFrom(this.cacheService.miningParts$);
    let partList = state.craftPartGroups.map(g => {
      let matchPart = parts.find(p => p.label === g.id);
      return new Group(matchPart, g.count);
    });
    this.updatePartList(partList);
    this.updateStatisticsMap(null);
    return 1;
  }

  buildState(state?: StateIsru): Observable<any> {
    if (state) {
      return fromPromise(this.setupFullState(state));
    } else {
      this.setupEmptyState();
    }

    return of(null);
  }

}
