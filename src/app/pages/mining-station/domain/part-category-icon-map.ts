import { Icons } from '../../../common/domain/icons';
import { PartCategory } from './part-category';

export let categoryIconMap = new Map<string, string>([
  ['isru', Icons.Converter],
  ['drill', Icons.Harvester],
  ['radiator', Icons.Radiator],
  ['solar-panel', Icons.PowerSolar],
  ['rtg', Icons.Radioactive],
  ['fuel-cell', Icons.FuelCell],
  ['battery', Icons.Battery],
  ['resource-tank', Icons.Fuel],
  ['resource-tank-ore', Icons.Ore],
  ['resource-tank-fuel', Icons.Fuel],
]);
