import { PartCategory } from './part-category';


interface ConverterLabel {
  converterName: string;
}

type ConverterProperties = ConverterLabel & keyof ResourceProperties;
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

interface CommonProperties {
  label: string;
  category: PartCategory;
  cost: number;
  mass: number;
}

export interface ResourceProperties {
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
}

export interface Converter extends ResourceProperties {
  converterName: string;
}

export interface CraftPart
  extends CommonProperties, ResourceProperties {
  converters?: ConverterProperties[];
}

function convertValuesToNumbers<T>(json: any): T {
  Object.entries(json)
    .filter(([, v]) => typeof v === 'string')
    .forEach(([k, v]) => {
      let result = (<string>v).toNumber();
      if (!isNaN(result)) {
        json[k] = result;
      }
    });
  return json;
}

export function craftPartFromJson(json: any): CraftPart {
  convertValuesToNumbers(json);

  if (json.converters) {
    json.converters = (<JsonConverterProperty[]>json.converters)
      .map(converterJson =>
        convertValuesToNumbers<ConverterProperties>(converterJson));
  }

  return <CraftPart>json;
}
