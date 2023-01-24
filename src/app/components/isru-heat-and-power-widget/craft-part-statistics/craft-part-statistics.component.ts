import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group } from '../../../common/domain/group';
import { Statistic, StatisticConfig, StatisticsGenerator } from '../domain/statistics-generator';
import { MatIconModule } from '@angular/material/icon';
import { Icons } from '../../../common/domain/icons';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { BasicAnimations } from '../../../common/animations/basic-animations';
import { IsruWidgetService } from '../isru-widget.service';
import { combineLatest, scan, takeUntil } from 'rxjs';
import { WithDestroy } from '../../../common/with-destroy';
import { CraftPart, ResourceProperties } from '../domain/craft-part';

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

const resourceProperties: (keyof ResourceProperties)[] = [
  'storageEc',
  'drawEc',
  'produceEc',
  'produceSolarEc',
  'drawHeat',
  'produceHeat',
  'storageLf',
  'storageOx',
  'storageOre',
  'storageMono',
  'drawLf',
  'drawOx',
  'drawOre',
  'produceLf',
  'produceOx',
  'produceOre',
  'produceMono',
];

@Component({
  standalone: true,
  selector: 'cp-craft-part-statistics',
  templateUrl: './craft-part-statistics.component.html',
  styleUrls: ['./craft-part-statistics.component.scss'],
  animations: [BasicAnimations.expandY],
  imports: [
    CommonModule,
    MatIconModule,
  ]
})
export class CraftPartStatisticsComponent extends WithDestroy() {

  @Input() title = 'Production and Consumption';

  statistics: StatisticsGenerator;

  constructor(private isruService: IsruWidgetService) {
    super();

    combineLatest([
      this.isruService.planet$,
      this.isruService.oreConcentration$,
      this.isruService.engineerBonus$,
      this.isruService.activeConverters$,
      this.isruService.craftPartGroups$,
    ]).pipe(
      scan((acc, newValue) => {
        let changesList = newValue.map((v, i) => v === acc[i] ? undefined : v);
        return [newValue, changesList];
      }, []),
      takeUntil(this.destroy$))
      .subscribe(([values, changes]) => {
        this.setup(new CraftSettings(values), new CraftSettings(changes));
      });
  }

  stats;
  private partsMap: Map<CraftPart, Group<CraftPart>>;

  private setup(values: CraftSettings, changes: CraftSettings) {
    if (changes.craftPartGroups) {
      this.partsMap = new Map(values.craftPartGroups
        .map(g => [g.item, g]));
    }

    let parts = values.craftPartGroups;

    type AffectType = 'solar' | 'ore-concentration' | 'bonus' | 'converters';
    let drills = parts.filter(({item}) => item.category === 'drill');
    let isrus = parts.filter(({item}) => item.category === 'isru');

    let changeAffectsMap = new Map<AffectType, Group<CraftPart>[]>([
      ['solar', parts.filter(({item}) => item.category === 'solar-panel')],
      ['ore-concentration', drills],
      ['bonus', drills.concat(isrus)],
      ['converters', parts.filter(({item}) => item.category === 'fuel-cell')
        .concat(isrus)],
    ]);

    let solarFactor = this.getSolarEfficiency(values.planet);

    let propertyGroupsMap = new Map<keyof ResourceProperties, Group<CraftPart>[]>(
      resourceProperties.map(key => [key, parts.filter(({item}) =>
        item[key] || item.converters?.some(c => c[key]))]),
    );

    type StatisticType = 'power=' | 'power-' | 'power+' | 'solarEfficiency'
      | 'heat-' | 'heat+' | 'lf=' | 'lf-' | 'lf+' | 'ox=' | 'ox-' | 'ox+';
    let statisticsMap = new Map<StatisticType, any>([
      ['power=', {
        label: 'Power Storage', icon: Icons.Power,
        key: <keyof CraftPart>'storageEc', measure: 'EC',
        calculate: (list: Group<CraftPart>[]) => list
          .filter(g => g.item.storageEc !== undefined)
          .map(g => g.count * <number>g.item.storageEc)
          .sum()
          .toSi(0),
      }],
    ]);

    let partGroups = Array.from(this.partsMap.values());
    this.stats = Array.from(statisticsMap.values())
      .map(m => {
        let a = m.calculate(partGroups);
        return {
          icon: m.icon,
          label: m.label,
          value: a + m.measure,
        };
      });
  }

  getLabel(index: number, item: Statistic): string {
    return item.label;
  }

  setupGenerator(body: CelestialBody) {
    if (!body) {
      this.statistics = null;
      return
    }

    let solarFactor = this.getSolarEfficiency(body);

    this.statistics = new StatisticsGenerator([
      new StatisticConfig('Power Storage', Icons.Power, 'storageEc', 'EC'),
      new StatisticConfig('Power Draw', Icons.Power, 'drawEc', 'EC/s'),
      new StatisticConfig('Power Production', Icons.Power, 'produceEc', 'EC/s',
        list => {
          let nonSolarTotal = list
            .filter(g => g.item['produceEc'] !== undefined)
            .map(g => g.count * g.item['produceEc'])
            .sum();
          let solarTotal = list
            .filter(g => g.item['produceSolarEc'] !== undefined)
            .map(g => g.count * g.item['produceSolarEc'] * solarFactor)
            .sum();
          return nonSolarTotal + solarTotal;
        }),
      new StatisticConfig('Solar Efficiency', Icons.SignalStrength, 'produceSolarEc', '%',
        list => {
          let hasSolar = list.some(g => g.item.produceSolarEc !== undefined);
          return hasSolar ? solarFactor * 100 : 0;
        }),
      new StatisticConfig('Heat Dissipation', Icons.Heat, 'drawHeat', 'W/s'),
      new StatisticConfig('Heat Production', Icons.Heat, 'produceHeat', 'W/s'),
      new StatisticConfig('Liquid Fuel Production', Icons.Fuel, 'produceLf', 'LF/s'),
    ]);

    // this.statistics.refresh(this.partGroups)
  }

  private getSolarEfficiency(body: CelestialBody): number {
    let kerbinSma = 13599840256;
    return 1 / (Math.pow(body.semiMajorAxis / kerbinSma, 2));
  }

}
