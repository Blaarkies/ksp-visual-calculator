import { BuiltStructure, ModuleName, ResourceName } from './domain';
import { PartProperties } from './create-parts-for-isru-widget';
import { withoutTranslationPart } from './common';

export function getPartPropertiesFromModule(module: BuiltStructure): PartProperties {
  let properties = module.properties;
  switch (properties.name) {
    case <ModuleName>'ModuleDeployableSolarPanel':
      return {produceSolarEc: properties.chargeRate};

    case <ModuleName>'ModuleGenerator':
      // todo: check for multi outputs
      return {produceEc: module.OUTPUT_RESOURCE[0].properties.rate};

    case <ModuleName>'ModuleResourceConverter':
      let resourceRatioMapIn = new Map<ResourceName, string>(
        module.INPUT_RESOURCE.map(r => [r.properties.ResourceName, r.properties.Ratio]));
      let resourceRatioMapOut = new Map<ResourceName, string>(
        module.OUTPUT_RESOURCE.map(r => [r.properties.ResourceName, r.properties.Ratio]));
      return {
        converterName: withoutTranslationPart(properties.ConverterName),
        produceEc: resourceRatioMapOut.get('ElectricCharge'),
        produceLf: resourceRatioMapOut.get('LiquidFuel'),
        produceOx: resourceRatioMapOut.get('Oxidizer'),
        produceMono: resourceRatioMapOut.get('MonoPropellant'),
        drawEc: resourceRatioMapIn.get('ElectricCharge'),
        drawLf: resourceRatioMapIn.get('LiquidFuel'),
        drawOx: resourceRatioMapIn.get('Oxidizer'),
        drawOre: resourceRatioMapIn.get('Ore'),
      } as PartProperties;

    case <ModuleName>'ModuleResourceHarvester':
      return {
        produceOre: properties.Efficiency,
        drawEc: module.INPUT_RESOURCE[0].properties.Ratio,
      };

    case <ModuleName>'ModuleCoreHeat':
      return {produceHeat: properties.MaxCoolant.split('//')[0]};

    case <ModuleName>'ModuleActiveRadiator':
      return {
        drawHeat: '' + Number(properties.maxEnergyTransfer) * .02,
        drawEc: module.RESOURCE[0].properties.rate,
      };

    default:
      return;
  }
}

export function getPartPropertiesFromResource(resource: BuiltStructure): PartProperties {
  let properties = resource.properties;
  switch (properties.name) {
    case <ResourceName>'ElectricCharge':
      return {storageEc: properties.maxAmount};

    case <ResourceName>'LiquidFuel':
      return {storageLf: properties.maxAmount};

    case <ResourceName>'Oxidizer':
      return {storageOx: properties.maxAmount};

    case <ResourceName>'Ore':
      return {storageOre: properties.maxAmount};

    case <ResourceName>'MonoPropellant':
      return {storageMono: properties.maxAmount};

    default:
      return;
  }
}
