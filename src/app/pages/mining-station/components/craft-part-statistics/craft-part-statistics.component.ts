import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group } from '../../../../common/domain/group';
import { IsruStatisticsGenerator, Statistic } from '../../domain/isru-statistics-generator';
import { MatIconModule } from '@angular/material/icon';
import { CelestialBody } from '../../../../services/json-interfaces/kerbol-system-characteristics';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { MiningBaseService } from '../../services/mining-base.service';
import { combineLatest, scan, takeUntil } from 'rxjs';
import { WithDestroy } from '../../../../common/with-destroy';
import { CraftPart } from '../../domain/craft-part';
import { StockEntitiesCacheService } from '../../../../services/stock-entities-cache.service';
import { StatisticColorCodedComponent } from './statistic-color-coded/statistic-color-coded.component';

class CraftSettings {
  planet: CelestialBody;
  oreConcentration: number;
  engineerBonus: number;
  activeConverters: string[];
  craftPartGroups: Group<CraftPart>[];

  constructor(list: any[]) {
    this.planet = list[0];
    this.oreConcentration = list[1];
    this.engineerBonus = list[2];
    this.activeConverters = list[3];
    this.craftPartGroups = list[4];
  }
}

@Component({
  standalone: true,
  selector: 'cp-craft-part-statistics',
  templateUrl: './craft-part-statistics.component.html',
  styleUrls: ['./craft-part-statistics.component.scss'],
  animations: [BasicAnimations.expandY],
  imports: [
    CommonModule,
    MatIconModule,
    StatisticColorCodedComponent,
  ]
})
export class CraftPartStatisticsComponent extends WithDestroy() {

  @Input() title = 'Production and Consumption';

  statistics: IsruStatisticsGenerator;

  private planetMap: Map<string, CelestialBody>;

  constructor(private isruService: MiningBaseService,
              cacheService: StockEntitiesCacheService) {
    super();

    cacheService.planets$
      .pipe(takeUntil(this.destroy$))
      .subscribe(characteristics =>
        this.planetMap = new Map<string, CelestialBody>(
          characteristics.bodies.map(p => [p.id, p])));

    combineLatest([
      this.isruService.planet$,
      this.isruService.oreConcentration$,
      this.isruService.engineerBonus$,
      this.isruService.activeConverters$,
      this.isruService.craftPartGroups$,
    ]).pipe(
      scan(([acc = []], newValue) => {
        let changesList = newValue.map((v, i) => v === acc[i] ? undefined : v);
        return [newValue, changesList];
      }, []),
      takeUntil(this.destroy$))
      .subscribe(([values, changes]) => {
        this.setup(new CraftSettings(values), new CraftSettings(changes));
      });

    this.isruService.craftPartCounts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(g => this.statistics?.updatePartCount(g))
  }

  private setup(values: CraftSettings, changes: CraftSettings) {
    if (!this.statistics) {
      return;
    }
    if (changes.craftPartGroups) {
      this.statistics = new IsruStatisticsGenerator(
        values.craftPartGroups,
        statsMap => this.isruService.updateStatisticsMap(statsMap));
      this.statistics.updateConverters(values.activeConverters);
      this.statistics.updateBonus(values.engineerBonus);
      this.statistics.updateOreConcentration(values.oreConcentration);
      this.statistics.updatePlanet(values.planet, this.planetMap);
    }

    if (changes.activeConverters) {
      this.statistics.updateConverters(values.activeConverters);
    }

    if (changes.engineerBonus) {
      this.statistics.updateBonus(values.engineerBonus);
    }

    if (changes.oreConcentration) {
      this.statistics.updateOreConcentration(values.oreConcentration);
    }

    if (changes.planet) {
      this.statistics.updatePlanet(values.planet, this.planetMap);
    }
  }

  getLabel(index: number, item: Statistic): string {
    return item.label;
  }

}
