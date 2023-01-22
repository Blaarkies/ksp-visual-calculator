import { PartCategory } from './part-category';

interface JsonPart {
  [key: string]: string;
}

interface ConverterLabel {
  converterName: string
}

type ConverterProperty = ConverterLabel & keyof PartProperties;
type JsonConverterProperty = ConverterLabel & keyof JsonPartProperties;

interface JsonPartProperties {
  storageEc: string;
  drawEc: string;
  produceEc: string;
  produceSolarEc: string;
  drawHeat: string;
  produceHeat: string;
  storageLf: string;
  storageOx: string;
  storageOre: string;
  storageMono: string;
  drawLf: string;
  drawOx: string;
  drawOre: string;
  produceLf: string;
  produceOx: string;
  produceOre: string;
  produceMono: string;

  converters: JsonConverterProperty[];
}

export class PartProperties {
  storageEc?: number;
  drawEc?: number;
  produceEc?: number;
  produceSolarEc?: number;

  drawHeat?: number;
  produceHeat?: number;

  storageLf?: number;
  storageOx?: number;
  storageOre?: number;
  storageMono?: number;
  drawLf?: number;
  drawOx?: number;
  drawOre?: number;
  produceLf?: number;
  produceOx?: number;
  produceOre?: number;
  produceMono?: number;

  converters?: ConverterProperty[];

  constructor({
                storageEc, drawEc, produceEc, produceSolarEc, drawHeat, produceHeat,
                storageLf, storageOx, storageOre, storageMono, drawLf, drawOx, drawOre,
                produceLf, produceOx, produceOre, produceMono, converters
              }: JsonPartProperties) {
    this.storageEc = storageEc?.toNumber();
    this.drawEc = drawEc?.toNumber();
    this.produceEc = produceEc?.toNumber();
    this.produceSolarEc = produceSolarEc?.toNumber();
    this.drawHeat = drawHeat?.toNumber();
    this.produceHeat = produceHeat?.toNumber();
    this.storageLf = storageLf?.toNumber();
    this.storageOx = storageOx?.toNumber();
    this.storageOre = storageOre?.toNumber();
    this.storageMono = storageMono?.toNumber();
    this.drawLf = drawLf?.toNumber();
    this.drawOx = drawOx?.toNumber();
    this.drawOre = drawOre?.toNumber();
    this.produceLf = produceLf?.toNumber();
    this.produceOx = produceOx?.toNumber();
    this.produceOre = produceOre?.toNumber();
    this.produceMono = produceMono?.toNumber();

    this.converters = (<JsonConverterProperty[]>converters)?.map(json =>
      (<ConverterProperty>{
        ...PartProperties.fromJson(json),
        converterName: json.converterName,
      }));
  }

  static fromJson(json: any): PartProperties {
    return new PartProperties(json);
  }
}

export class CraftPart {

  constructor(
    public label: string,
    public category: PartCategory,
    public cost: number,
    public mass: number,
    public properties: PartProperties,
  ) {
  }

  static fromJson(json: any): CraftPart {
    return new CraftPart(
      json.label,
      json.category,
      json.cost.toNumber(),
      json.mass.toNumber(),
      PartProperties.fromJson(json.properties),
    );
  }
}
