import { Icons } from '../../../common/domain/icons';
import { PartCategory } from './part-category';

export let categoryIconMap = new Map<PartCategory, string>([
  ['converter', Icons.Converter],
  ['harvester', Icons.Harvester],
  ['radiator', Icons.Radiator],
  ['solar-panel', Icons.PowerSolar],
  ['rtg', Icons.Radioactive],
  ['fuel-cell', Icons.FuelCell],
  ['battery', Icons.Power],
  ['resource-tank', Icons.Fuel],
]);
