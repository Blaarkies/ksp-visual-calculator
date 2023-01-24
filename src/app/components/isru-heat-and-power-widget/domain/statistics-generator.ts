import { Icons } from '../../../common/domain/icons';
import { Group } from '../../../common/domain/group';
import { CraftPart } from './craft-part';

export class Statistic {
  label: string;
  value: string;
  icon: Icons;
}

type Measure = 'EC' | 'EC/s' | 'W/s' | 'LF/s' | '%';

export class StatisticConfig {
  constructor(
    public label: string,
    public icon: Icons,
    public key: keyof CraftPart,
    public suffix: Measure,
    public valueOverride?: (list: Group<CraftPart>[]) => number,
  ) {
  }
}

export class StatisticsGenerator {

  statistics: Statistic[] = [];

  constructor(private rowsConfig: StatisticConfig[]) {
  }

  refresh(list: Group<CraftPart>[]) {
    if (!list) {
      return;
    }
    this.statistics = this.rowsConfig
      .map(c => this.getPropertyStat(list, c.label, c.icon, c.key, c.suffix, c.valueOverride))
      .filter(s => s.hasValue);
  }

  private getPropertyStat(list: Group<CraftPart>[],
                          label: string,
                          icon: Icons,
                          key: keyof CraftPart,
                          suffix: Measure,
                          valueOverride?: (list: Group<CraftPart>[]) => number) {
    let total = valueOverride
      ? valueOverride(list)
      : list
        .filter(g => g.item[key] !== undefined)
        .map(g => g.count * <number>g.item[key])
        .sum();
    return {
      label,
      value: total.toSi(0) + suffix,
      icon,
      hasValue: total !== 0,
    };
  }
}
