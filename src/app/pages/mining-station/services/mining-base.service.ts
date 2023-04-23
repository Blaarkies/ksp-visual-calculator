import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  Observable,
  of,
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
  oreConcentration$ = new BehaviorSubject<number>(.05);
  engineerBonus$ = new BehaviorSubject<number>(null);
  activeConverters$ = new BehaviorSubject<string[]>([]);
  craftPartTypes$ = new BehaviorSubject<Group<CraftPart>[]>([]);
  craftPartCounts$ = new BehaviorSubject<Group<CraftPart>>(null);
  statisticsMap$ = new BehaviorSubject<StatisticsMapType>(null);

  craftParts: Group<CraftPart>[];

  constructor(private cacheService: StockEntitiesCacheService) {
    this.craftPartTypes$.subscribe(types => this.craftParts = types);
    this.craftPartCounts$
      .pipe(filter(updated => !!updated))
      .subscribe(updated => {
        let match = this.craftParts.find(stale => stale.item === updated.item);
        if (match) {
          match.count = updated.count;
        }
      });
  }

  destroy() {
    this.planet$.complete();
    this.oreConcentration$.complete();
    this.engineerBonus$.complete();
    this.activeConverters$.complete();
    this.craftPartTypes$.complete();
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

  updateActiveConverters(list: string[]) {
    this.activeConverters$.next(list);
  }

  updatePartList(list: Group<CraftPart>[]) {
    this.craftPartTypes$.next(list);
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
    this.updateActiveConverters([]);
    this.updatePartList([]);
    this.updateStatisticsMap(null);
  }

  async setupFullState(state: StateIsru): Promise<boolean> {
    let planets = await firstValueFrom(this.cacheService.planets$);
    let planet = planets.bodies.find(b => b.id === state.planet);
    this.updatePlanet(planet);
    this.updateOreConcentration(state.oreConcentration);
    this.updateEngineerBonus(state.engineerBonus);
    this.updateActiveConverters(state.activeConverters ?? []);

    let parts = await firstValueFrom(this.cacheService.miningParts$);
    let partList = state.craftPartGroups.map(g => {
      let matchPart = parts.find(p => p.label === g.id);
      return new Group(matchPart, g.count);
    });
    this.updatePartList(partList);
    this.updateStatisticsMap(null);
    return true;
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
