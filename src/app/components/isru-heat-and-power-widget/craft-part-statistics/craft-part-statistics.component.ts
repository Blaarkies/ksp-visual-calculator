import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group } from '../../../common/domain/group';
import { PartProperties } from '../domain/craft-part';
import { StatisticConfig, StatisticsGenerator } from '../domain/statistics-generator';
import { MatIconModule } from '@angular/material/icon';
import { Icons } from '../../../common/domain/icons';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { BasicAnimations } from '../../../common/animations/basic-animations';

type InputKeys = keyof CraftPartStatisticsComponent;

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
export class CraftPartStatisticsComponent implements OnChanges {

  @Input() title = 'Production and Consumption';
  @Input() body: CelestialBody;
  @Input() partGroups: Group<PartProperties>[];

  statistics: StatisticsGenerator;

  ngOnChanges(changes: SimpleChanges) {
    if (changes[<InputKeys>'body']) {
      this.setupGenerator(this.body);
    }

    if (changes[<InputKeys>'partGroups'] && this.body) {
      this.statistics.refresh(this.partGroups)
    }
  }

  setupGenerator(body: CelestialBody) {
    if (!body) {
      this.statistics = null;
      return
    }

    let solarFactor = this.getSolarEfficiency(this.body);

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
      new StatisticConfig('Fuel Production', Icons.Fuel, 'produceFuel', 'LF/s'),
    ]);

    this.statistics.refresh(this.partGroups)
  }

  private getSolarEfficiency(body: CelestialBody): number {
    let kerbinSma = 13599840256;
    return 1 / (Math.pow(body.semiMajorAxis / kerbinSma, 2));
  }
}
