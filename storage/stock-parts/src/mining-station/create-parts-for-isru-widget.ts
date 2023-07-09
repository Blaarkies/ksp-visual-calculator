import {
  Configurator,
  ConfiguratorEvents,
} from '../configurator';
import { withoutTranslationPart } from '../domain/common';
import {
  ExtractorConfig,
  SfsPartStructure,
  TransformationFunction,
} from '../domain/domain';
import { extract } from '../extract-part-properties';
import {
  getPartPropertiesFromModule,
  getPartPropertiesFromResource,
} from './module-interogator';
import { PartProperties } from './part-properties';

type Category =
  'isru'
  | 'radiator'
  | 'drill'
  | 'solar-panel'
  | 'rtg'
  | 'fuel-cell'
  | 'battery'
  | 'resource-tank'
  | 'resource-tank-ore'
  | 'resource-tank-fuel'
  | 'unknown';

let convertersLabelMap = new Map<string, string>([
  ['Lf+Ox', 'Liquid Fuel + Oxidizer'],
  ['LiquidFuel', 'Liquid Fuel'],
  ['Oxidizer', 'Oxidizer'],
  ['Monoprop', 'Monopropellant'],
  ['MonoPropellant', 'Monopropellant'],
  ['Fuel Cell', 'Fuel Cell'],
]);

function getCategory(part: SfsPartStructure, processedProperties: PartProperties): Category {
  let tags = withoutTranslationPart(part.tags[0]);

  if (processedProperties.storageOre) {
    return 'resource-tank-ore';
  }

  if (processedProperties.storageLf
    || processedProperties.storageOx
    || processedProperties.storageMono) {
    return 'resource-tank-fuel';
  }

  if (tags.includes('drill')) {
    return 'drill';
  }

  if (processedProperties.converters?.some(c => c.drawOre)) {
    return 'isru';
  }

  if (tags.includes('capacitor')) {
    return 'battery';
  }

  if (tags.includes('photo')) {
    return 'solar-panel';
  }

  if (tags.includes('isotope')) {
    return 'rtg';
  }

  if (processedProperties.converters?.some(c => c.produceEc)) {
    return 'fuel-cell';
  }

  if (tags.includes('fueltank')) {
    return 'resource-tank';
  }

  if (processedProperties.drawHeat) {
    return 'radiator';
  }

  return 'unknown';
}

function getProperties(part: SfsPartStructure): PartProperties {
  let modulesProperties = part.MODULE?.map(m => getPartPropertiesFromModule(m))
    .filter(p => p) || [];
  let resourceProperties = part.RESOURCE?.map(m => getPartPropertiesFromResource(m))
    .filter(p => p) || [];

  let properties = Object.assign({},
    ...resourceProperties,
    ...modulesProperties.filter((p: any) => !p.converterName?.[0]),
  );
  let converterOptions = modulesProperties.filter((p: any) => p.converterName);
  if (converterOptions.length) {
    properties.converters = converterOptions.map(co => ({
      ...co,
      converterName: convertersLabelMap.get(co.converterName),
    }));
  }

  let regExpTrim = /\b[\w.,\s]+\b/i; // trim values (remove /t and comments)
  let trimmedProperties = Object.entries(properties)
    .map(([k, v]: [string, string]) => {
      let trimValue = typeof v === 'string' ? v.match(regExpTrim)?.[0] : v;
      return ({[k]: trimValue});
    });
  properties = Object.assign({}, ...trimmedProperties) ?? properties;

  return properties;
}

function getSearchTags(tagString: string): string[] {
  return tagString
    .split('=')
    .at(-1)
    .replaceAll(/[^a-z0-9 ]+/ig, '')
    .split(' ')
    .filter(t => t);
}

function getId(name: string, path: string): string {
  return `${name}:${path.match(/\/([^\/]+)\.cfg$/i)?.[1]}`;
}

function transformFunction(): TransformationFunction {
  return (parsed, path) => {
    let part = parsed.PART[0];
    let properties = getProperties(part);
    return {
      id: getId(part.name[0], path),
      label: withoutTranslationPart(part.title[0]),
      category: getCategory(part, properties),
      tags: getSearchTags(part.tags[0]),
      cost: part.cost[0],
      mass: part.mass[0],
      ...properties,
    };
  };
}


let configIsruPartsOnly: ExtractorConfig = {
  gamePath: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Kerbal Space Program',
  outputMode: 'one-file',
  filter: {
    whitelist: {
      folders: [
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
      tags: [
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
        'fueltank',
        'mono',
      ],
    },
    blacklist: {
      files: ['Mk3-ShuttleAdapter.cfg'],
      tags: [
        'remove',
        'split',
        'aero',
        'ion',
        'cabin',
        'tour',
      ],
    },
  },
};

let configurator = new Configurator(configIsruPartsOnly);
configurator.emitEvent
  .addListener(ConfiguratorEvents.run, config =>
    extract(config, transformFunction()));
