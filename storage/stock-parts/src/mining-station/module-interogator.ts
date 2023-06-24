import { SfsPartStructure, ModuleName, ResourceName } from '../domain/domain';
import { withoutTranslationPart } from '../domain/common';
import { PartProperties } from './part-properties';

export function getPartPropertiesFromModule(module: SfsPartStructure): PartProperties {
  switch (module.name[0]) {
    case <ModuleName>'ModuleDeployableSolarPanel':
      return {produceSolarEc: module.chargeRate[0]};

    case <ModuleName>'ModuleGenerator':
      // todo: check for multi outputs
      return {produceEc: module.OUTPUT_RESOURCE[0].rate[0]};

    case <ModuleName>'ModuleResourceConverter':
      let resourceRatioMapIn = new Map<ResourceName, string>(
        module.INPUT_RESOURCE.map(r => [r.ResourceName[0], r.Ratio[0]]));
      let resourceRatioMapOut = new Map<ResourceName, string>(
        module.OUTPUT_RESOURCE.map(r => [r.ResourceName[0], r.Ratio[0]]));
      return {
        converterName: withoutTranslationPart(module.ConverterName[0]),
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
        produceOre: module.Efficiency[0],
        drawEc: module.INPUT_RESOURCE[0].Ratio[0],
      };

    case <ModuleName>'ModuleCoreHeat':
      return {produceHeat: module.MaxCoolant[0]};

    case <ModuleName>'ModuleActiveRadiator':
      return {
        drawHeat: '' + Number(module.maxEnergyTransfer) * .02,
        drawEc: module.RESOURCE[0].rate[0],
      };

    default:
      return;
  }
}

export function getPartPropertiesFromResource(resource: SfsPartStructure): PartProperties {
  switch (resource.name[0]) {
    case <ResourceName>'ElectricCharge':
      return {storageEc: resource.maxAmount[0]};

    case <ResourceName>'LiquidFuel':
      return {storageLf: resource.maxAmount[0]};

    case <ResourceName>'Oxidizer':
      return {storageOx: resource.maxAmount[0]};

    case <ResourceName>'Ore':
      return {storageOre: resource.maxAmount[0]};

    case <ResourceName>'MonoPropellant':
      return {storageMono: resource.maxAmount[0]};

    default:
      return;
  }
}
