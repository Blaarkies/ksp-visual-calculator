import { Injectable } from '@angular/core';
import { CraftPart } from './domain/craft-part';
import { Group } from '../../common/domain/group';
import { ReplaySubject } from 'rxjs';
import { CelestialBody } from '../../services/json-interfaces/kerbol-system-characteristics';
import { StatisticsMapType } from './domain/isru-statistics-generator';

@Injectable({
  providedIn: 'any'
})
export class IsruWidgetService {

  planet$ = new ReplaySubject<CelestialBody>();
  oreConcentration$ = new ReplaySubject<number>();
  engineerBonus$ = new ReplaySubject<number>();
  activeConverters$ = new ReplaySubject<string[]>();
  craftPartGroups$ = new ReplaySubject<Group<CraftPart>[]>();
  craftPartCounts$ = new ReplaySubject<Group<CraftPart>>();
  statisticsMap$ = new ReplaySubject<StatisticsMapType>();

  constructor() {
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
}
