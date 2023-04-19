import { Icons } from '../../../common/domain/icons';
import { Group } from '../../../common/domain/group';
import { Converter, CraftPart, ResourceProperties } from './craft-part';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { SpaceObjectType } from '../../../common/domain/space-objects/space-object-type';
import { PartCategory } from './part-category';
import { ReplaySubject } from 'rxjs';
import { Common } from '../../../common/common';

export class Statistic {
  label: string;
  icon: string;
  valueDisplay?: number;
  valueNumeric?: number;
  measure: string;
  type: StatisticDisplayType;
  consume?: number;
  produce?: number;
}

type StatisticDisplayType = 'display-only'
  | 'excess'
  | 'excess-reverse';

type Measure = 'EC' | 'EC/s'
  | 'LF' | 'LF/s'
  | 'Ox' | 'Ox/s'
  | 'Mono' | 'Mono/s'
  | 'Ore' | 'Ore/s'
  | '%'
  | 'W';

type AffectType = 'solar' | 'ore-concentration' | 'bonus' | 'converters';

export type StatisticType =
  'cost' | 'mass'
  | 'power=' | 'power-' | 'power+'
  | 'solarEfficiency' | 'engineerBonus'
  | 'heat-' | 'heat+'
  | 'lf=' | 'lf-' | 'lf+'
  | 'ox=' | 'ox-' | 'ox+'
  | 'mono=' | 'mono-' | 'mono+'
  | 'ore=' | 'ore-' | 'ore+';

interface StatisticConfig {
  label: string;
  icon: Icons;
  measure: Measure;
  calculate: () => number;
  lastValue?: number;
  order?: number;
}

export type StatisticsMapType = Map<StatisticType, StatisticConfig>;

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

export class IsruStatisticsGenerator {

  results: Statistic[];
  statisticsMap$ = new ReplaySubject<StatisticsMapType>();

  private partsMap: Map<CraftPart, Group<CraftPart>>;
  private changeAffectsMap = new Map<AffectType, Group<CraftPart>[]>;
  private resourcePartGroupsMap = new Map<keyof ResourceProperties, Group<CraftPart>[]>;
  private resourceToDrillMap = new Map<keyof ResourceProperties, Group<CraftPart>[]>;
  private resourceConverterGroupsMap = new Map<keyof ResourceProperties, Converter[]>;

  private statisticsMap = new Map<StatisticType, StatisticConfig>;

  private solarFactor: number;
  private engineerBonus: number;
  private oreConcentration: number;

  constructor(private partGroups: Group<CraftPart>[],
              private onStatisticsMapUpdate: (statsMap: Map<StatisticType, StatisticConfig>) => void) {
    this.partsMap = new Map(partGroups
      .map(g => [g.item, g]));

    let splitMap = new Map<PartCategory, number>(
      (<PartCategory[]>['isru', 'drill', 'solar-panel', 'fuel-cell'])
        .map((k, i) => [k, i]));
    let [drills = [], isrus = [], solarPanels = [], fuelCells = []]
      = partGroups.splitFilter(({item}) => splitMap.get(item.category));

    this.changeAffectsMap = new Map<AffectType, Group<CraftPart>[]>([
      ['solar', solarPanels],
      ['ore-concentration', drills],
      ['bonus', drills.concat(isrus)],
      ['converters', fuelCells.concat(isrus)],
    ]);

    let [converterPartGroups = [],
      drillPartGroups = [],
      otherPartGroups = []] = partGroups.splitFilter(({item}) =>
      item.converters ? 0 : item.category === 'drill' ? 1 : 2);

    this.resourcePartGroupsMap = new Map<keyof ResourceProperties, Group<CraftPart>[]>(
      resourceProperties.map(key =>
        [key, otherPartGroups.filter(({item}) => item[key])]));

    this.resourceToDrillMap = new Map<keyof ResourceProperties, Group<CraftPart>[]>(
      resourceProperties.map(key =>
        [key, drillPartGroups.filter(({item}) => item[key])]));

    let virtualConverterGroups = converterPartGroups
      .map(g => g.item.converters
        .map(c => ({...c, parent: g})))
      .flatMap();
    this.resourceConverterGroupsMap = new Map<keyof ResourceProperties, Converter[]>(
      resourceProperties
        .map(key => [key, virtualConverterGroups.filter(c => c[key] || c.parent.item[key])]));

    this.buildStatisticsMap();
  }

  private buildStatisticsMap() {
    this.statisticsMap = new Map<StatisticType, StatisticConfig>([
      ['cost', {
        label: 'Cost', icon: Icons.Cost, measure: '√', order: 0,
        calculate: () => Array.from(this.partsMap.values())
          .map(g => g.count * g.item.cost).sum(),
      }],
      ['mass', {
        label: 'Mass', icon: Icons.Mass, measure: 't', order: 1,
        calculate: () => Array.from(this.partsMap.values())
          .map(g => g.count * g.item.mass).sum(),
      }],

      ['power=', {
        label: 'Power Storage', icon: Icons.Battery, measure: 'EC', order: 2,
        calculate: () => this.resourcePartGroupsMap.get('storageEc')
          .map(g => g.count * g.item.storageEc).sum(),
      }],
      ['power-', {
        label: 'Power Draw', icon: Icons.Power, measure: 'EC/s', order: 3,
        calculate: () => this.resourcePartGroupsMap.get('drawEc')
          .map(g => g.count * g.item.drawEc)
          .concat(
            this.resourceConverterGroupsMap?.get('drawEc')
              .filter(c => c.isActive)
              .map(c => c.parent.count * c.drawEc * this.engineerBonus),
            this.resourceToDrillMap?.get('drawEc')
              .map(d => d.count * d.item.drawEc
                * this.engineerBonus))
          .sum(),
      }],
      ['power+', {
        label: 'Power Production', icon: Icons.Power, measure: 'EC/s', order: 4,
        calculate: () => this.resourcePartGroupsMap.get('produceEc')
          .map(g => g.count * g.item.produceEc)
          .concat(
            this.resourcePartGroupsMap.get('produceSolarEc')
              .map(g => g.count * g.item.produceSolarEc
                * this.solarFactor))
          .concat(
            this.resourceConverterGroupsMap?.get('produceEc')
              .filter(c => c.isActive)
              .map(c => c.parent.count * c.produceEc))
          .sum(),
      }],

      ['solarEfficiency', {
        label: 'Solar Efficiency', icon: Icons.SolarToPower, measure: '%', order: 5,
        calculate: () => this.resourcePartGroupsMap.get('produceSolarEc').length
          && (this.solarFactor * 100).toInt(),
      }],

      ['heat-', {
        label: 'Heat Dissipation', icon: Icons.Heat, measure: 'W', order: 6,
        calculate: () => this.resourcePartGroupsMap.get('drawHeat')
          .map(g => g.count * g.item.drawHeat).sum(),
      }],
      ['heat+', {
        label: 'Heat Production', icon: Icons.Temperature, measure: 'W', order: 7,
        calculate: () => this.resourcePartGroupsMap.get('produceHeat')
          .map(g => g.count * g.item.produceHeat)
          .concat(
            this.resourceConverterGroupsMap?.get('produceHeat')
              .filter(c => c.isActive)
              .map(c => c.parent.count * c.parent.item.produceHeat),
            this.resourceToDrillMap.get('produceHeat')
              .map(g => g.count * g.item.produceHeat))
          .sum(),
      }],

      ['ore=', {
        label: 'Ore Storage', icon: Icons.Ore, measure: 'Ore', order: 8,
        calculate: () => this.resourcePartGroupsMap.get('storageOre')
          .map(g => g.count * g.item.storageOre)
          .sum(),
      }],
      ['ore-', {
        label: 'Ore Usage', icon: Icons.Ore, measure: 'Ore/s', order: 9,
        calculate: () => this.resourcePartGroupsMap.get('drawOre')
          .map(g => g.count * g.item.drawOre)
          .concat(
            this.resourceConverterGroupsMap?.get('drawOre')
              .filter(c => c.isActive)
              .map(c => c.parent.count * c.drawOre
                * this.engineerBonus))
          .sum(),
      }],
      ['ore+', {
        label: 'Ore Production', icon: Icons.Ore, measure: 'Ore/s', order: 10,
        calculate: () => this.resourceToDrillMap.get('produceOre')
          .map(g => g.count * g.item.produceOre
            * this.engineerBonus
            * this.oreConcentration
            * .8) // TODO: some config value affects out put by this much
          .sum(),
      }],

      ...([
        {
          order: 11,
          key: 'lf=',
          label: 'Liquid Fuel Storage',
          icon: Icons.Fuel,
          measure: 'LF',
          resourceKey: 'storageLf'
        },
        {order: 14, key: 'ox=', label: 'Oxidizer Storage', icon: Icons.Fuel, measure: 'Ox', resourceKey: 'storageOx'},
        {
          order: 17,
          key: 'mono=',
          label: 'Monopropellant Storage',
          icon: Icons.Fuel,
          measure: 'Mono',
          resourceKey: 'storageMono'
        },
      ].map(({order, key, label, icon, measure, resourceKey}) => [key, {
        label, icon, measure, order,
        calculate: () => this.resourcePartGroupsMap.get(resourceKey as keyof ResourceProperties)
          .map(g => g.count * g.item[resourceKey])
          .sum(),
      }]) as any),
      ...([
        {order: 12, key: 'lf-', label: 'Liquid Fuel Usage', icon: Icons.Fuel, measure: 'LF/s', resourceKey: 'drawLf'},
        {order: 15, key: 'ox-', label: 'Oxidizer Usage', icon: Icons.Fuel, measure: 'Ox/s', resourceKey: 'drawOx'},
      ].map(({order, key, label, icon, measure, resourceKey}) => [key, {
        label, icon, measure, order,
        calculate: () => this.resourceConverterGroupsMap.get(resourceKey as keyof ResourceProperties)
          .filter(c => c.isActive)
          .map(c => c.parent.count * c[resourceKey])
          .sum(),
      }]) as any),
      ...([
        {
          order: 13,
          key: 'lf+',
          label: 'Liquid Fuel Production',
          icon: Icons.Fuel,
          measure: 'LF/s',
          resourceKey: 'produceLf'
        },
        {
          order: 16,
          key: 'ox+',
          label: 'Oxidizer Production',
          icon: Icons.Fuel,
          measure: 'Ox/s',
          resourceKey: 'produceOx'
        },
        {
          order: 18,
          key: 'mono+',
          label: 'Monopropellant Production',
          icon: Icons.Fuel,
          measure: 'Mono/s',
          resourceKey: 'produceMono'
        },
      ].map(({order, key, label, icon, measure, resourceKey}) => [key, {
        label, icon, measure, order,
        calculate: () => this.resourceConverterGroupsMap.get(resourceKey as keyof ResourceProperties)
          .filter(c => c.isActive)
          .map(c => c.parent.count * c[resourceKey] * this.engineerBonus)
          .sum(),
      }]) as any),
    ]);

    this.updateStats();
  }

  private updateStats() {
    Array.from(this.statisticsMap.values())
      .forEach(stat =>
        stat.lastValue = Common.formatNumberShort(stat.calculate()));

    let {combinedStats, usedStats} = this.getCombinedStats(this.statisticsMap);

    this.results = Array.from(this.statisticsMap.values())
      .filter(m => m.lastValue
        && !usedStats.some(s => s.label === m.label))
      .map(m => {
        return {
          label: m.label,
          type: 'display-only',
          valueDisplay: m.lastValue,
          icon: m.icon.toString(),
          measure: m.measure,
          order: m.order,
        } as (Statistic & { order });
      })
      .concat(combinedStats)
      .sort((a, b) => a.order - b.order) as Statistic[];

    this.statisticsMap$.next(this.statisticsMap);
    this.onStatisticsMapUpdate(this.statisticsMap);
  }

  private createCombinedStat(statsMap: Map<StatisticType, StatisticConfig>,
                             label: string, type: StatisticDisplayType,
                             consumeType: StatisticType, produceType: StatisticType)
    : (Statistic & { order }) {
    let consumer = statsMap.get(consumeType);
    let producer = statsMap.get(produceType);
    if (consumer.lastValue || producer.lastValue) {
      let configForMeta = producer ?? consumer;
      return {
        label, type,
        consume: consumer.lastValue || 0,
        produce: producer.lastValue || 0,
        icon: configForMeta.icon.toString(),
        measure: configForMeta.measure,
        order: configForMeta.order,
      };
    }

    return null;
  }

  private getCombinedStats(statsMap: Map<StatisticType, StatisticConfig>)
    : { combinedStats: (Statistic & { order })[], usedStats: StatisticConfig[] } {
    let stats = this.statisticsMap;
    let combinedStats: (Statistic & any)[] = [];
    let usedTypes: StatisticType[] = [];

    let powerUsage = this.createCombinedStat(statsMap, 'Power Excess', 'excess',
      'power-', 'power+');
    if (powerUsage) {
      combinedStats.push(powerUsage);
      usedTypes.push('power-', 'power+');
    }

    let heatExcess = this.createCombinedStat(statsMap, 'Heat Excess', 'excess-reverse',
      'heat-', 'heat+');
    if (heatExcess) {
      combinedStats.push(heatExcess);
      usedTypes.push('heat-', 'heat+');
    }

    let lf = this.createCombinedStat(statsMap, 'Liquid Fuel Excess', 'excess',
      'lf-', 'lf+');
    if (lf) {
      combinedStats.push(lf);
      usedTypes.push('lf-', 'lf+');
    }

    let ox = this.createCombinedStat(statsMap, 'Oxidizer Excess', 'excess',
      'ox-', 'ox+');
    if (ox) {
      combinedStats.push(ox);
      usedTypes.push('ox-', 'ox+');
    }

    let ore = this.createCombinedStat(statsMap, 'Ore Excess', 'excess',
      'ore-', 'ore+');
    if (ore) {
      combinedStats.push(ore);
      usedTypes.push('ore-', 'ore+');
    }

    let usedStats = usedTypes.map(t => stats.get(t));

    return {combinedStats, usedStats};
  }

  private getSolarEfficiency(body: CelestialBody): number {
    let kerbinSma = 13599840256;
    return 1 / (Math.pow(body.semiMajorAxis / kerbinSma, 2));
  }

  updateConverters(activeConverters: string[]) {
    Array.from(this.resourceConverterGroupsMap.values())
      .flatMap()
      .distinct()
      .forEach(c => c.isActive = activeConverters.includes(c.converterName));

    this.updateStats();
  }

  updateBonus(engineerBonus: number) {
    this.engineerBonus = engineerBonus;

    this.updateStats();
  }

  updateOreConcentration(oreConcentration: number) {
    this.oreConcentration = oreConcentration;

    this.updateStats();
  }

  updatePlanet(body: CelestialBody, planetMap: Map<string, CelestialBody>) {
    let planet = body ?? planetMap.get('kerbin');

    let solarDistancePlanet = planet.type === SpaceObjectType.Moon.name
      ? planetMap.get(planet.parent)
      : planet;
    this.solarFactor = this.getSolarEfficiency(solarDistancePlanet);

    this.updateStats();
    // TODO: account planet rotation for solar efficiency
  }

  updatePartCount(newGroup: Group<CraftPart>) {
    let partFound = this.partsMap.get(newGroup.item);
    partFound.count = newGroup.count;

    this.updateStats();
  }

}
