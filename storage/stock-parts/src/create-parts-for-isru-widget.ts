import { extract } from './extract-part-properties';
import { BuiltStructure, TransformationFunction } from './domain';
import { getPartPropertiesFromModule, getPartPropertiesFromResource } from './module-interogator';
import { withoutTranslationPart } from './common';

export class PartProperties {
  converters?: PartProperties[];

  storageEc?: string;
  drawEc?: string;
  produceEc?: string;
  produceSolarEc?: string;

  drawHeat?: string;
  produceHeat?: string;

  storageLf?: string;
  storageOx?: string;
  storageOre?: string;
  storageMono?: string;
  drawLf?: string;
  drawOx?: string;
  drawOre?: string;
  produceLf?: string;
  produceOx?: string;
  produceOre?: string;
  produceMono?: string;
}

export type Category =
  'converter'
  | 'radiator'
  | 'harvester'
  | 'solar-panel'
  | 'rtg'
  | 'fuel-cell'
  | 'battery'
  | 'resource-tank'
  | 'unknown';

function getCategory(part: BuiltStructure, processedProperties: PartProperties): Category {
  let tags = withoutTranslationPart(part.properties.tags);

  if (processedProperties.storageOre) {
    return 'resource-tank';
  }

  if (tags.includes('isru')) {
    return 'converter';
  }

  if (tags.includes('capacitor')) {
    return 'battery';
  }

  if (tags.includes('sun')) {
    return 'solar-panel';
  }

  if (tags.includes('rtg')) {
    return 'rtg';
  }

  if (tags.includes('bank')) {
    return 'fuel-cell';
  }

  if (tags.includes('fueltank')) {
    return 'resource-tank';
  }

  if (tags.includes('cool')) {
    return 'radiator';
  }

  if (tags.includes('harvest')) {
    return 'harvester';
  }

  return 'unknown';
}

function getProperties(part: BuiltStructure): PartProperties {
  let modulesProperties = part.MODULE?.map(m => getPartPropertiesFromModule(m))
    .filter(p => p) || [];
  let resourceProperties = part.RESOURCE?.map(m => getPartPropertiesFromResource(m))
    .filter(p => p) || [];

  let properties = Object.assign({},
    ...resourceProperties,
    ...modulesProperties.filter((p: any) => !p.converterName),
  );
  let converterOptions = modulesProperties.filter((p: any) => p.converterName);
  if (converterOptions.length) {
    properties.converters = converterOptions;
  }

  return properties;
}

function transformFunction(): TransformationFunction {
  return cfgStructure => {
    let part = cfgStructure.PART[0];
    let props = part.properties;
    let properties = getProperties(part);
    return {
      label: withoutTranslationPart(props.title),
      category: getCategory(part, properties),
      cost: props.cost,
      mass: props.mass,
      properties,
    };
  };
}

extract(
  {
    gamePath: 'C:\\Steam\\steamapps\\common\\Kerbal Space Program',
    filterTags: [
      'solar',
      'capacitor',
      'bank',
      'charge',
      'isru',
      'cool',
      'radiat',
      'ore',
      'drill',
      'fuel',
      'mono',
    ],
    filterFolders: [
      'fuelcell',
      'isru',
      'miniisru',
      'minidrill',
      'radialdrill',
      'LargeTank',
      'radialtank',
      'smalltank',
      'electrical',
      'fueltank',
      'thermal',
    ],
    outputMode: 'one-file',
  },
  transformFunction(),
);
