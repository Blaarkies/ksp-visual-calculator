import { PartCategory } from './part-category';

export class PartProperties {
  storageEc?: number;
  drawEc?: number;
  produceEc?: number;
  produceSolarEc?: number;

  drawHeat?: number;
  produceHeat?: number;

  produceFuel?: number;
  drawLf?: number;
  drawOx?: number;
}

export class CraftPart {
  label: string;
  category: PartCategory;

  properties: PartProperties;
}
