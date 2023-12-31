import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  combineLatest,
  firstValueFrom,
  map,
  mergeWith,
  Observable,
  sampleTime,
  scan,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Group } from '../../../../common/domain/group';
import { WithDestroy } from '../../../../common/with-destroy';
import { PlanetoidAssetDto } from '../../../../common/domain/dtos/planetoid-asset.dto';
import { StockEntitiesCacheService } from '../../../../services/stock-entities-cache.service';
import { CraftPart } from '../../domain/craft-part';
import {
  IsruStatisticsGenerator,
  Statistic,
} from '../../domain/isru-statistics-generator';
import { MiningBaseService } from '../../services/mining-base.service';
import { StatisticColorCodedComponent } from '../statistic-color-coded/statistic-color-coded.component';

class CraftSettings {
  planet: PlanetoidAssetDto;
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
  selector: 'cp-craft-part-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    StatisticColorCodedComponent,
  ],
  templateUrl: './craft-part-statistics.component.html',
  styleUrls: ['./craft-part-statistics.component.scss'],
  animations: [BasicAnimations.expandY],
})
export class CraftPartStatisticsComponent extends WithDestroy() {

  @Input() title = 'Production and Consumption';

  statistics: IsruStatisticsGenerator;

  private readonly planetMap$: Observable<Map<string, PlanetoidAssetDto>>;

  constructor(private miningBaseService: MiningBaseService,
              cacheService: StockEntitiesCacheService) {
    super();

    this.planetMap$ = cacheService.planetoids$
      .pipe(
        map(characteristics => new Map<string, PlanetoidAssetDto>(
          characteristics.planetoids.map(p => [p.id, p]),
        )),
        takeUntil(this.destroy$));

    let mb = miningBaseService;
    combineLatest([mb.loadState$, this.planetMap$])
      .pipe(
        mergeWith(
          mb.planetUpdated$,
          mb.oreConcentrationUpdated$,
          mb.engineerBonusUpdated$,
          mb.activeConvertersUpdated$,
          mb.partSelectionUpdated$,
          mb.partCountUpdated$,
        ),
        sampleTime(50),
        map(() => [
          mb.planet,
          mb.oreConcentration,
          mb.engineerBonus,
          mb.activeConverters,
          mb.partSelection,
        ]),
        scan(([acc = []], newValue) => {
          let changesList = newValue.map((v, i) => v === acc[i] ? undefined : v);
          return [newValue, changesList];
        }, []),
        takeUntil(this.destroy$))
      .subscribe(([values, changes]) =>
        this.setup(new CraftSettings(values), new CraftSettings(changes)));

    mb.partCountUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(g => this.statistics?.updatePartCount(g));
  }

  private async setup(values: CraftSettings, changes: CraftSettings) {
    let planetMap = await firstValueFrom(this.planetMap$);

    if (changes.craftPartGroups) {
      this.statistics = new IsruStatisticsGenerator(
        values.craftPartGroups,
        statsMap => this.miningBaseService.updateStatisticsMap(statsMap));
      this.statistics.updateConverters(values.activeConverters);
      this.statistics.updateBonus(values.engineerBonus);
      this.statistics.updateOreConcentration(values.oreConcentration);
      this.statistics.updatePlanet(values.planet, planetMap);
    }

    if (!this.statistics) {
      return;
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
      this.statistics.updatePlanet(values.planet, planetMap);
    }
  }

  getLabel(index: number, item: Statistic): string {
    return item.label;
  }

}
